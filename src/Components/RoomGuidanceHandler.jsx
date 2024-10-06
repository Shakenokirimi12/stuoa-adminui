import { useState, useEffect, useCallback } from "react";
import { Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, useBreakpointValue, Text } from "@chakra-ui/react";

const fetchAvailableRoom = async (onOpen, setAvailableRoom) => {
  try {
    const response = await fetch(`http://${window.location.host}/api/adminui/getQueueStatus`);
    const data = await response.json();
    if (data.length > 0) {
      setAvailableRoom(data[0]);
      onOpen();
    }
  } catch (err) {
    console.error("Error fetching unresolved errors:", err);
  }
};

const AvailableRoomHandler = () => {
  const [availableRoom, setAvailableRoom] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const size = useBreakpointValue({ base: "full", md: "xl" });

  const fetchErrors = useCallback(() => {
    fetchAvailableRoom(onOpen, setAvailableRoom);
  }, [onOpen]);

  useEffect(() => {
    const interval = setInterval(fetchErrors, 5000);

    return () => clearInterval(interval);
  }, [fetchErrors]);

  const resolveError = async (availableRoom) => {
    let assignedChallengeIdToAvailableRoom = availableRoom.ChallengeId;
    try {
      const response = await fetch(`http://${window.location.host}/api/adminui/setGuidedStatus/${assignedChallengeIdToAvailableRoom}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
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
      {availableRoom && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={false} closeOnEsc={false} size={size}>
          <ModalOverlay />
          <ModalContent maxW="90vw" maxH="90vh" p={6} borderRadius="md" boxShadow="lg">
            <ModalHeader fontSize="2xl" color={"red"}>
              　部屋が使用可能になりました。以下のチームを誘導してください。
            </ModalHeader>
            <ModalBody>
              <Box>
                <Text fontSize="xl">
                  <strong>チーム名:</strong> {availableRoom.GroupName}
                </Text>
                <Text fontSize="xl">
                  <strong>ルーム:</strong> {availableRoom.RoomID}
                </Text>
                <Text fontSize="xl">
                  <strong>整理番号:</strong> {availableRoom.QueueNumber}
                </Text>
                <Text fontSize="xl">
                  <strong>人数:</strong> {availableRoom.MemberCount}
                </Text>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" onClick={() => resolveError(availableRoom)}>
                誘導する
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default AvailableRoomHandler;
