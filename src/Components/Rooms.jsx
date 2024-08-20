import { useState, useEffect } from "react";
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Button, Spinner, Alert, AlertIcon, Input, FormControl, FormLabel, Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure } from "@chakra-ui/react";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    challengerName: "",
    challengerId: "",
    difficulty: 1,
    memberCount: 1,
    status: "",
    startTime: "",
  });
  const [actionType, setActionType] = useState(""); // Track current action (update or delete)

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();

  const fetchRooms = async () => {
    try {
      const response = await fetch(`http://${process.env.REACT_APP_API_IP}/api/adminui/rooms/list`);
      const result = await response.json();

      if (response.ok) {
        setRooms(result.data);
      } else {
        setError(result.message || "Failed to fetch rooms");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 10000); // Update list every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleRoomSelect = (roomID) => {
    const room = rooms.find((r) => r.RoomID === roomID);
    if (room) {
      setSelectedRoom(roomID);
      setFormData({
        challengerName: room.ChallengerName,
        challengerId: room.ChallengerId,
        difficulty: room.Difficulty,
        memberCount: room.MemberCount,
        status: room.Status,
        startTime: room.StartTime,
      });
      onEditOpen(); // Open the edit modal when a room is selected
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!selectedRoom) return;

    const response = await fetch(`http://${process.env.REACT_APP_API_IP}/api/adminui/rooms/update/${selectedRoom}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (response.ok) {
      // Update the list of rooms immediately
      fetchRooms();
      setError("");
      onEditClose(); // Close the edit modal after successful update
    } else {
      setError(result.message || "Failed to update room");
    }
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;

    const response = await fetch(`http://${process.env.REACT_APP_API_IP}/api/adminui/rooms/delete/${selectedRoom}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (response.ok) {
      setRooms((prevRooms) => prevRooms.filter((room) => room.RoomID !== selectedRoom));
      setSelectedRoom(null);
      setFormData({
        challengerName: "",
        challengerId: "",
        difficulty: 1,
        memberCount: 1,
        status: "",
        startTime: "",
      });
      setError("");
      onConfirmClose(); // Close the confirm modal after successful deletion
    } else {
      setError(result.message || "Failed to delete room");
    }
  };

  const formatDateTime = (dateTime) => {
    if (dateTime) {
      const date = new Date(dateTime);
      if (!isNaN(date.getTime())) {
        // Convert to Tokyo time
        const offset = 9 * 60; // Tokyo is UTC+9
        const utc = date.getTime() + date.getTimezoneOffset() * 60000;
        const tokyoTime = new Date(utc + offset * 60000);

        // Format the date as 'yyyy-MM-ddTHH:mm'
        const year = tokyoTime.getFullYear();
        const month = String(tokyoTime.getMonth() + 1).padStart(2, "0");
        const day = String(tokyoTime.getDate()).padStart(2, "0");
        const hours = String(tokyoTime.getHours()).padStart(2, "0");
        const minutes = String(tokyoTime.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
      }
    }
    return "";
  };

  return (
    <Box p={5}>
      <Heading mb={4}>Rooms</Heading>
      {loading && <Spinner size="xl" />}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      {!loading && !error && (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Room ID</Th>
                <Th>Challenger Name</Th>
                <Th>Challenger ID</Th>
                <Th>Difficulty</Th>
                <Th>Member Count</Th>
                <Th>Status</Th>
                <Th>Start Time</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rooms.map((room) => (
                <Tr key={room.RoomID}>
                  <Td>{room.RoomID}</Td>
                  <Td>{room.ChallengerName}</Td>
                  <Td>{room.ChallengerId}</Td>
                  <Td>{room.Difficulty}</Td>
                  <Td>{room.MemberCount}</Td>
                  <Td>{room.Status}</Td>
                  <Td>{new Date(room.StartTime).toLocaleString({ timeZone: "Asia/Tokyo" })}</Td>
                  <Td>
                    <Button onClick={() => handleRoomSelect(room.RoomID)}>Edit</Button>
                    <Button
                      onClick={() => {
                        setSelectedRoom(room.RoomID);
                        setActionType("delete");
                        onConfirmOpen();
                      }}
                      colorScheme="red"
                      ml={2}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Room</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Challenger Name</FormLabel>
              <Input name="challengerName" value={formData.challengerName} onChange={handleInputChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Challenger ID</FormLabel>
              <Input name="challengerId" value={formData.challengerId} onChange={handleInputChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Difficulty</FormLabel>
              <Select name="difficulty" value={formData.difficulty} onChange={handleInputChange}>
                {[1, 2, 3, 4].map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Member Count</FormLabel>
              <Input type="number" name="memberCount" value={formData.memberCount} onChange={handleInputChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Status</FormLabel>
              <Input name="status" value={formData.status} onChange={handleInputChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Start Time</FormLabel>
              <Input type="datetime-local" name="startTime" value={formatDateTime(formData.startTime)} onChange={handleInputChange} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleUpdate}>
              Update Room
            </Button>
            <Button variant="ghost" onClick={onEditClose} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{actionType === "delete" ? "Confirm Deletion" : "Confirm Update"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{actionType === "delete" ? <p>Are you sure you want to delete this room?</p> : <p>Are you sure you want to update this room?</p>}</ModalBody>
          <ModalFooter>
            {actionType === "delete" ? (
              <Button colorScheme="red" onClick={handleDelete}>
                Delete
              </Button>
            ) : (
              <Button colorScheme="blue" onClick={handleUpdate}>
                Update
              </Button>
            )}
            <Button variant="ghost" onClick={onConfirmClose} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Rooms;
