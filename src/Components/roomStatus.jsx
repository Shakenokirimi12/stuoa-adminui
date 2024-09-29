import { useState, useEffect } from "react";
import { Box, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { ScaleFade } from "@chakra-ui/react";

const RoomStatus = () => {
  const [rooms, setRooms] = useState({
    A: { status: "未実施", color: "red.500" },
    B: { status: "未実施", color: "red.500" },
    C: { status: "未実施", color: "red.500" },
  });

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await fetch(`http://${window.location.host}/api/adminui/rooms/list`);
        const data = await response.json();

        // Prepare a new room status object
        const updatedRooms = {
          A: { status: "未実施", color: "red.500" },
          B: { status: "未実施", color: "red.500" },
          C: { status: "未実施", color: "red.500" },
        };

        data.data.forEach((room) => {
          if (room.Status === "Started") {
            updatedRooms[room.RoomID] = { status: "実施中", color: "green.500" };
          }
        });

        setRooms(updatedRooms);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    // Fetch data periodically
    const intervalId = setInterval(fetchRoomData, 5000); // Fetch every 5 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const Room = ({ roomId, status, color }) => (
    <ScaleFade initialScale={0.9} in>
      <Box w="100vw" h="33vh" bg={color} d="flex" alignItems="center" justifyContent="center" transition="background-color 0.5s ease" p={4}>
        <VStack>
          <Text fontSize="2xl" fontWeight="bold">{`Room ${roomId}`}</Text>
          <Text fontSize="80px" color={useColorModeValue("gray.100", "gray.700")}>
            {status === "実施中" ? "ゲーム実施中" : "ゲーム未実施"}
          </Text>
        </VStack>
      </Box>
    </ScaleFade>
  );

  return (
    <VStack spacing={0} h="100vh" w="100vw">
      <Room roomId="A" status={rooms.A.status} color={rooms.A.color} />
      <Room roomId="B" status={rooms.B.status} color={rooms.B.color} />
      <Room roomId="C" status={rooms.C.status} color={rooms.C.color} />
    </VStack>
  );
};

export default RoomStatus;
