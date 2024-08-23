import { useState, useEffect } from "react";
import { Select, VStack, Box, Button, Table, Thead, Tbody, Tr, Th, Td, useToast, Heading, TableContainer, Spinner, Alert, AlertIcon, Input, FormControl, FormLabel, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, ChakraProvider } from "@chakra-ui/react";

// Error Management Component
const ErrorManagement = () => {
  const [errors, setErrors] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      fetchErrorHistory();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchErrorHistory = async () => {
    try {
      const response = await fetch(`http://${window.location.host}/api/adminui/errorHistory`);
      const data = await response.json();
      setErrors(data);
    } catch (err) {
      console.error("Error fetching error history:", err);
    }
  };

  const resolveError = async (errorId) => {
    try {
      const response = await fetch(`http://${window.location.host}/api/adminui/errorsolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ErrorId: errorId }),
      });

      if (response.ok) {
        toast({
          title: "Error resolved",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchErrorHistory();
      } else {
        console.error("Error resolving error:", response.statusText);
      }
    } catch (err) {
      console.error("Error resolving error:", err);
    }
  };

  return (
    <Box p={4} borderWidth={1} borderRadius="md" shadow="md" bg="white">
      <Heading as="h2" size="lg" mb={4} textAlign="center">
        Error Management
      </Heading>
      <TableContainer>
        <Table variant="simple">
          <Thead bg="gray.100">
            <Tr>
              <Th>Error ID</Th>
              <Th>Description</Th>
              <Th>From Where</Th>
              <Th>Reported Time</Th>
              <Th>Is Solved</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {errors.map((error) => (
              <Tr key={error.ErrorId}>
                <Td>{error.ErrorId}</Td>
                <Td>{error.Description}</Td>
                <Td>{error.FromWhere}</Td>
                <Td>{new Date(error.ReportedTime).toLocaleString()}</Td>
                <Td>{error.IsSolved ? "Yes" : "No"}</Td>
                <Td>
                  {!error.IsSolved && (
                    <Button colorScheme="teal" onClick={() => resolveError(error.ErrorId)}>
                      Resolve
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGroup, setselectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    GroupName: "",
    GroupId: "",
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
      const response = await fetch(`http://${window.location.host}/api/adminui/rooms/list`);
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

  const handleRoomSelect = (GroupId) => {
    const room = rooms.find((r) => r.GroupId === GroupId);
    if (room) {
      setselectedGroup(GroupId);
      setFormData({
        GroupName: room.GroupName,
        GroupId: room.GroupId,
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
    if (!selectedGroup) return;

    const response = await fetch(`http://${window.location.host}/api/adminui/rooms/update/${selectedGroup}`, {
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
    if (!selectedGroup) return;

    const response = await fetch(`http://${window.location.host}/api/adminui/rooms/delete/${selectedGroup}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (response.ok) {
      // 処理が成功したら再度リストを取得
      fetchRooms();
      setselectedGroup(null);
      setFormData({
        GroupName: "",
        GroupId: "",
        difficulty: 1,
        memberCount: 1,
        status: "",
        startTime: "",
      });
      setError("");
      onConfirmClose(); // 成功時に確認モーダルを閉じる
    } else {
      setError(result.message || "Failed to delete room");
      setselectedGroup(null);
      setFormData({
        GroupName: "",
        GroupId: "",
        difficulty: 1,
        memberCount: 1,
        status: "",
        startTime: "",
      });
      fetchRooms(); // エラー時もリストを再取得して更新
      onConfirmClose(); // Close the confirm modal after successful deletion
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
    <Box p={4} borderWidth={1} borderRadius="md" shadow="md" bg="white">
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
            <Thead bg="gray.100">
              <Tr>
                <Th>Room ID</Th>
                <Th>Group Name</Th>
                <Th>Group ID</Th>
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
                  <Td>{room.GroupName}</Td>
                  <Td>{room.GroupId}</Td>
                  <Td>{room.Difficulty}</Td>
                  <Td>{room.MemberCount}</Td>
                  <Td>{room.Status}</Td>
                  <Td>{new Date(room.StartTime).toLocaleString({ timeZone: "Asia/Tokyo" })}</Td>
                  <Td>
                    <Button onClick={() => handleRoomSelect(room.GroupId)}>Edit</Button>
                    <Button
                      onClick={() => {
                        setselectedGroup(room.GroupId);
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
              <FormLabel>Group Name</FormLabel>
              <Input name="GroupName" value={formData.GroupName} onChange={handleInputChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Group ID</FormLabel>
              <Input name="GroupId" value={formData.GroupId} onChange={handleInputChange} />
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
// Main App Component
const App = () => (
  <ChakraProvider>
    <VStack spacing={8} align="stretch" p={4}>
      <ErrorManagement />
      <Rooms />
    </VStack>
  </ChakraProvider>
);

export default App;
