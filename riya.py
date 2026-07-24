import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Load dataset
dataset = pd.read_csv("Salary_Data.csv")

# Independent and dependent variables
X = dataset[['YearsExperience']]
y = dataset['Salary']

# Train test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

# KNN model
knn = KNeighborsRegressor(n_neighbors=3)

# Train the model
knn.fit(X_train, y_train)

# Prediction
y_pred = knn.predict(X_test)

# Mean Squared Error
mse = mean_squared_error(y_test, y_pred)

# R2 Score
r2 = r2_score(y_test, y_pred)

print("Mean Squared Error:", mse)
print("R2 Score:", r2)
from sklearn.metrics import mean_squared_error, r2_score

mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("Mean Squared Error:", mse)
print("R2 Score:", r2)

# Accuracy in percentage
accuracy = r2 * 100
print("Model Accuracy:", accuracy, "%")