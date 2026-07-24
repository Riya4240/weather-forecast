# Multiple Linear Regression - Diabetes Dataset with Graphs

import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# =========================
# LOAD DATASET
# =========================
data = pd.read_csv("diabetes.csv")

print("Columns in dataset:\n", data.columns)

# Assume last column is target (modify if needed)
X = data.iloc[:, :-1]   # all columns except last
y = data.iloc[:, -1]    # last column as target

# =========================
# TRAIN TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# =========================
# MODEL TRAINING
# =========================
model = LinearRegression()
model.fit(X_train, y_train)

# =========================
# PREDICTION
# =========================
y_pred = model.predict(X_test)

# =========================
# EVALUATION
# =========================
print("\nModel Results")
print("Intercept:", model.intercept_)
print("Mean Squared Error:", mean_squared_error(y_test, y_pred))
print("R2 Score:", r2_score(y_test, y_pred))

# =========================
# 📊 GRAPH 1: FEATURE IMPORTANCE
# =========================
plt.figure(figsize=(10,5))
plt.bar(X.columns, model.coef_)
plt.title("Feature Importance (Regression Coefficients)")
plt.xlabel("Features")
plt.ylabel("Coefficient Value")
plt.xticks(rotation=45)
plt.show()

# =========================
# 📊 GRAPH 2: ACTUAL vs PREDICTED
# =========================
plt.figure(figsize=(6,6))
plt.scatter(y_test, y_pred)
plt.plot([y.min(), y.max()], [y.min(), y.max()])
plt.title("Actual vs Predicted Values")
plt.xlabel("Actual")
plt.ylabel("Predicted")
plt.show()

# =========================
# 📊 GRAPH 3: RESIDUAL PLOT
# =========================
residuals = y_test - y_pred

plt.figure(figsize=(6,5))
plt.scatter(y_pred, residuals)
plt.axhline(y=0)
plt.title("Residual Plot")
plt.xlabel("Predicted Values")
plt.ylabel("Residuals")
plt.show()