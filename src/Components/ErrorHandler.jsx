import { useState, useEffect, useCallback } from "react";
import { Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, useBreakpointValue } from "@chakra-ui/react";

const fetchUnresolvedErrors = async (onOpen, setCurrentError) => {
  try {
    const response = await fetch(`http://${process.env.REACT_APP_API_IP}/api/adminui/errorcheck`);
    const data = await response.json();
    if (data.length > 0) {
      setCurrentError(data[0]);
      onOpen();
    }
  } catch (err) {
    console.error("Error fetching unresolved errors:", err);
  }
};

const ErrorHandler = () => {
  const [currentError, setCurrentError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const size = useBreakpointValue({ base: "full", md: "xl" });

  const fetchErrors = useCallback(() => {
    fetchUnresolvedErrors(onOpen, setCurrentError);
  }, [onOpen]);

  useEffect(() => {
    const interval = setInterval(fetchErrors, 1000);

    return () => clearInterval(interval);
  }, [fetchErrors]);

  const resolveError = async (errorId) => {
    try {
      const response = await fetch(`http://${process.env.REACT_APP_API_IP}/api/adminui/errorsolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ErrorId: errorId }),
      });

      if (response.ok) {
        onClose();
      } else {
        console.error("Error resolving error:", response.statusText);
      }
    } catch (err) {
      console.error("Error resolving error:", err);
    }
  };

  return (
    <>
      {currentError && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={false} closeOnEsc={false} size={size}>
          <ModalOverlay />
          <ModalContent maxW="90vw" maxH="90vh" p={6} borderRadius="md" boxShadow="lg">
            <ModalHeader fontSize="2xl">Error Detected</ModalHeader>
            <ModalBody>
              <Box>
                <p>
                  <strong>Error ID:</strong> {currentError.ErrorId}
                </p>
                <p>
                  <strong>Description:</strong> {currentError.Description}
                </p>
                <p>
                  <strong>From Where:</strong> {currentError.FromWhere}
                </p>
                <p>
                  <strong>Reported Time:</strong> {currentError.ReportedTime}
                </p>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="red" mr={3} onClick={onClose}>
                Ignore
              </Button>
              <Button colorScheme="green" onClick={() => resolveError(currentError.ErrorId)}>
                Resolve
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default ErrorHandler;
