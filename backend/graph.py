import matplotlib.pyplot as plt

dates = ["2024-03-01", "2024-03-02", "2024-03-03"]
scores = [7, 5, 8]  # Example mental wellness scores

plt.plot(dates, scores, marker='o')
plt.title("Mental Wellness Trend")
plt.xlabel("Date")
plt.ylabel("Wellness Score (0-10)")
plt.grid(True)
plt.show()
