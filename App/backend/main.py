from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import numpy as np
from PIL import Image
from skimage import transform, color
import joblib

app = FastAPI()

# Load the saved models
svm_model = joblib.load('models/malaria_svc_model-v2.joblib')
pca = joblib.load('models/malaria_pca-v2.joblib')
logistic_regression_model = joblib.load('models/logistic_regression_model.pkl')

def preprocess_image(image_bytes):
    # Convert bytes to PIL Image
    img = Image.open(io.BytesIO(image_bytes))

    # Padding
    img = padding(img, 220)

    # Convert to numpy array
    img = np.array(img)

    # Convert to grayscale
    img = color.rgb2gray(img)

    # Brighten
    img = brighten(img.reshape(220 * 220))

    # Resize
    img = transform.resize(img.reshape(220, 220), (100, 100))

    # Flatten
    img = img.reshape(1, 100 * 100)

    # PCA transform
    img_reduced = pca.transform(img)

    return img_reduced

def padding(image, size):
    desired_size = size
    old_size = image.size
    ratio = float(desired_size) / max(old_size)
    new_size = tuple([int(x * ratio) for x in old_size])
    im = image.resize(new_size, Image.Resampling.LANCZOS)
    new_im = Image.new('RGB', (desired_size, desired_size))
    new_im.paste(image, ((desired_size - new_size[0]) // 2,
                         (desired_size - new_size[1]) // 2))
    return new_im

def brighten(image):
    max_ = np.max(image)
    image[image == 0.0] = max_
    return image

@app.post("/predict/svm")
async def predict_svm(file: UploadFile = File(...)):
    try:
        # Read image file
        image_bytes = await file.read()

        # Preprocess the image
        processed_image = preprocess_image(image_bytes)

        # Make prediction
        prediction = svm_model.predict(processed_image)

        # Get class name
        class_name = "Parasitized" if prediction[0] == 1 else "Uninfected"

        # Try to get probability if available
        try:
            probability = svm_model.predict_proba(processed_image)
            confidence = float(max(probability[0]))
        except:
            # If probability is not available, use decision function as a proxy for confidence
            decision_score = float(abs(svm_model.decision_function(processed_image)[0]))
            confidence = 1 / (1 + np.exp(-decision_score))  # sigmoid transformation

        return JSONResponse({
            "class": class_name,
            "confidence": confidence,
            "model": "SVM"
        })

    except Exception as e:
        return JSONResponse({
            "error": str(e)
        }, status_code=500)

@app.post("/predict/logistic")
async def predict_logistic(file: UploadFile = File(...)):
    try:
        # Read image file
        image_bytes = await file.read()

        # Preprocess the image
        processed_image = preprocess_image(image_bytes)

        # Make prediction
        prediction = logistic_regression_model.predict(processed_image)

        # Get class name
        class_name = "Parasitized" if prediction[0] == 1 else "Uninfected"

        # Get probability
        try:
            probability = logistic_regression_model.predict_proba(processed_image)
            confidence = float(max(probability[0]))
        except:
            # Fallback if predict_proba is not available
            confidence = abs(logistic_regression_model.decision_function(processed_image)[0])

        return JSONResponse({
            "class": class_name,
            "confidence": confidence,
            "model": "Logistic Regression"
        })

    except Exception as e:
        return JSONResponse({
            "error": str(e)
        }, status_code=500)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Run with: uvicorn main:app --reload