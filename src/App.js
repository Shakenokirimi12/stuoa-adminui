import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import './App.css';
import Nav from './Components/Nav';
import GroupRegistrationForm from './Components/regGroup';
import NotFoundPage from './Components/NotFoundPage';
import Rooms from './Components/Rooms';
import ErrorManagementPage from './Components/ErrorManagementPage';
import ErrorHandler from './Components/ErrorHandler'; // Import ErrorHandler
import StatusPage from './Components/StatusPage';
import Stats from './Components/Stats';
import GroupList from './Components/ExitMenu';
import RoomStatus from './Components/roomStatus';
import Rankings from './Components/Rankings';

const App = () => {
  const location = useLocation();
  const showNav = !location.pathname.includes('/adminui/rankings'); // Change '/adminui/rankings' to your actual rankings path

  return (
    <div className="App">
      {showNav && <Nav />}
      {showNav && <ErrorHandler />}
      <Routes>
        <Route path="/adminui" element={<StatusPage />} />
        <Route path="/adminui/Home" element={<StatusPage />} />
        <Route path="/adminui/Stats" element={<Stats />} />
        <Route path="/adminui/Register" element={<GroupRegistrationForm />} />
        <Route path="/adminui/Rooms" element={<Rooms />} />
        <Route path="/adminui/Errors" element={<ErrorManagementPage />} />
        <Route path="/adminui/ExitMenu" element={<GroupList />} />
        <Route path="/adminui/roomStatus" element={<RoomStatus />} />
        <Route path="/adminui/rankings" element={<Rankings />} /> {/* Add Rankings route */}
        <Route path="/adminui/*" element={<NotFoundPage />} />
      </Routes>
      {/* <Footer /> */}
    </div>
  );
};

const Main = () => (
  <ChakraProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ChakraProvider>
);

export default Main;
