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

function App() {
  return (
    <div className="App">
      <ChakraProvider>
        <Nav />
        <ErrorHandler /> {/* Add ErrorHandler here */}
        <BrowserRouter>
          <div className="App">
            <Routes>
              <Route path="/" element={<StatusPage />} />
              <Route path="/Home" element={<StatusPage />} />
              <Route path="/Register" element={<GroupRegistrationForm />} />
              <Route path="/Rooms" element={<Rooms />} />
              <Route path="/Errors" element={<ErrorManagementPage />} />
              <Route path="/*" element={<NotFoundPage />} />
            </Routes>
            {/* <Footer /> */}
          </div>
        </BrowserRouter>
      </ChakraProvider>
    </div>
  );
}

export default App;
