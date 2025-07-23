## 💻 VideoCall Front-End

A modern single-page application (SPA) built with React.js that enables real-time video calling using WebRTC and Socket.IO.

### 🚀 Features

* User registration and authentication (JWT-based)
* Real-time video and audio calling using WebRTC
* Signaling through Socket.IO
* User list and session management
* Responsive UI for desktop and mobile
* State management with Context API or Redux
* Integration with the back-end API

### ⚙️ Tech Stack

| Front-End Layer  | Technology                               |
| ---------------- | ---------------------------------------- |
| Framework        | React.js (Hooks & Functional Components) |
| Routing          | React Router                             |
| State Management | Context API / Redux                      |
| Real-Time Comm.  | WebRTC + Socket.IO Client                |
| HTTP Requests    | Axios                                    |
| Styling          | Tailwind CSS / CSS Modules               |

### 🧩 Installation & Setup

```bash
git clone https://github.com/naderianaliakbar/VideoCall-Front-End.git
cd VideoCall-Front-End
npm install
```

Copy `.env.example` to `.env` and configure:

```dotenv
REACT_APP_API_URL=http://localhost:5000
```

### 🏁 Running the App (Development)

```bash
npm start
```

App will be accessible at `http://localhost:3000`.

### 🛠️ Key Components

* **Authentication**

  * Login and registration pages
* **Dashboard**

  * List of users available for video calls
* **Video Call**

  * Peer-to-peer connection using WebRTC
  * Call status and in-call UI
* **Signaling**

  * Socket.IO events for offer, answer, and ICE candidate exchange

### 📘 Project Structure

```
src/
├── components/       # Video components, UI elements
├── contexts/         # Auth & Video state
├── hooks/            # Custom React hooks
├── pages/            # Login, Dashboard, VideoCall
├── services/         # API and WebRTC logic
└── index.js
```

### 💡 Usage Tips

* Ensure `REACT_APP_API_URL` matches the back-end server URL
* Grant camera and microphone permissions for WebRTC
* Use HTTPS in production for proper WebRTC signaling

### 🤝 Contribution

Contributions are welcome! Please create a new branch and submit pull requests. Follow code linting and testing guidelines.

### 📄 License

This project is licensed under the MIT License.
