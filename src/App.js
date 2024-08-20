import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import Nav from './Components/Nav';
import GroupRegistrationForm from './Components/regGroup';
import NotFoundPage from './Components/NotFoundPage';
import Rooms from './Components/Rooms';

function App() {
  return (
    <div className="App">
      <ChakraProvider>
        <Nav />
        <BrowserRouter>
          <div className="App">
            <Routes>
              <Route path="/Register" element={<GroupRegistrationForm />} />
              <Route path="/Rooms" element={<Rooms />} />
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
