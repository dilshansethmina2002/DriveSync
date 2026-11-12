import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login'; 
import Register from './pages/Register';

function App() {
  return (
    <Router>
      {/* Toaster එක මෙහි දැමූ විට මුළු ඇප් එකේම ඕනෑම තැනක toast වැඩ කරයි */}
      <Toaster position="top-right" reverseOrder={false} />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;