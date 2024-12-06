# Malaria Detection Using Machine Learning

This project leverages machine learning techniques to detect malaria from microscopic cell images with high accuracy. By analyzing blood sample images, the system classifies cells into two categories: **Parasitized** and **Uninfected**, streamlining diagnosis and enabling early treatment.

---

## Table of Contents
1. [Introduction](#introduction)
2. [Literature Survey](#literature-survey)
3. [Dataset Description](#dataset-description)
4. [Technologies Used](#technologies-used)
5. [Getting Started](#getting-started)

---

## Introduction

This project addresses a **Supervised-Classification** problem, where the goal is to classify cell images into:
1. **Parasitized** (indicating the presence of malaria parasites)
2. **Uninfected** (indicating no malaria parasites)

By training on a labeled dataset, the model learns patterns and features that distinguish infected from uninfected cells, aiding healthcare professionals in managing malaria cases.

---

## Literature Survey

Machine learning has significantly contributed to medical image analysis in recent years. Common algorithms like **Logistic Regression** and **Support Vector Machines (SVM)** have been widely used in binary classification tasks due to their simplicity, interpretability, and effectiveness.

### Key Algorithms:
- **Logistic Regression**: Used for its simplicity and baseline evaluation.
- **SVM**: Effective for image-based classification tasks with high accuracy.

These methods have been chosen based on their success in prior diagnostic applications.

---

## Dataset Description

The dataset used is sourced from Kaggle and contains labeled images of blood cell samples.

- **Dataset Link**: [Cell Images for Detecting Malaria](https://www.kaggle.com/datasets/iarunava/cell-images-for-detecting-malaria/data)
- **Total Images**: 27,000+
- **Classes**:
  - **Parasitized**: Contains malaria parasites.
  - **Uninfected**: No malaria parasites.
- **Image Format**: JPEG
- **Resolution**: Varies (resized during preprocessing for uniformity)

The dataset is divided into separate folders for each class, making it ideal for supervised learning.

---

## Technologies Used

- Python (3.8+)
- NumPy
- Pandas
- Matplotlib
- Scikit-learn
- OpenCV
- Jupyter Notebook

---

## Getting Started

### Prerequisites
1. Install Python (3.8 or later).
2. Install required libraries using pip:
   ```bash
   pip install numpy pandas matplotlib scikit-learn opencv-python
