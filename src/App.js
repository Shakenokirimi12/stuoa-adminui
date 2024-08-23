import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

function App() {
  return (
    <div className="App">
      <ChakraProvider>
        <Nav />
        <ErrorHandler /> {/* Add ErrorHandler here */}
        <BrowserRouter>
          <div className="App">
            <Routes>
              <Route path="/adminui" element={<StatusPage />} />
              <Route path="/adminui/Home" element={<StatusPage />} />
              <Route path="/adminui/Stats" element={<Stats />} />
              <Route path="/adminui/Register" element={<GroupRegistrationForm />} />
              <Route path="/adminui/Rooms" element={<Rooms />} />
              <Route path="/adminui/Errors" element={<ErrorManagementPage />} />
              <Route path="/adminui/ExitMenu" element={<GroupList />} />
              <Route path="/adminui/*" element={<NotFoundPage />} />
            </Routes>
            {/* <Footer /> */}
          </div>
        </BrowserRouter>
      </ChakraProvider>
    </div>
  );
}

export default App;
