# Use the official Python image as the base
FROM python:3.10-slim

# Set the working directory
WORKDIR /app/project

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project source code
COPY . .

# Expose the port (commonly 8000 for Django)
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]