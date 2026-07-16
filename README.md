# LaTeX CV Resume Creator App
A web application designed to automate the creation of curriculum vitae (CV) and resumes. The primary goal is to streamline the process for users, removing the difficulty of manually formatting and structuring a professional document.

## Features
- **Streamlined Input**: Users can enter their information through simple text fields.
- **Automated Formatting**: The application automatically formats the typed content into a professional CV/resume layout.
- **Template-Based**: Utilizes professional templates to ensure a polished and consistent final document.

## Prerequisites
- Node.js (v14 or higher)
- npm (or yarn)
- Python (for backend dependencies)

## Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd cv-resume-creator-app
    ```

2.  **Install Backend Dependencies**
    Navigate to the backend directory and install Python dependencies:
    ```bash
    cd server
    pip install -r requirements.txt
    ```

3.  **Install Frontend Dependencies**
    Navigate to the frontend directory and install Node.js dependencies:
    ```bash
    cd client
    npm install
    ```

## Usage

To run the development server for both the frontend and backend:

1.  **Start the Backend**
    Open a new terminal, navigate to the backend directory, and run the server:
    ```bash
    cd server
    python manage.py runserver
    ```

2.  **Start the Frontend**
    Open another terminal, navigate to the frontend directory, and start the development server:
    ```bash
    cd client
    npm run dev
    ```

3.  **Access the Application**
    Open your browser and go to `http://localhost:5173`.
