import { useState } from "react";
import { Box, Input, Button, FormControl, FormLabel, ChakraProvider, VStack, Heading, Alert, AlertIcon } from "@chakra-ui/react";
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from "@chakra-ui/react";

const GroupRegistrationForm = () => {
  const [groupname, setGroupname] = useState("");
  const [message, setMessage] = useState("");
  const [playerCount, setPlayerCount] = useState(1);
  const [difficulty, setDifficulty] = useState(1);
  const [roomId, setRoomId] = useState("");
  const [messageType, setMessageType] = useState("");

  const handlePlayerCountChange = (value) => setPlayerCount(value);
  const handleDifficultyChange = (value) => setDifficulty(value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`http://${process.env.REACT_APP_API_IP}/api/adminui/regChallenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomID: roomId,
          challengerName: groupname,
          playerCount: playerCount,
          difficulty: difficulty,
        }),
      });

      const result = await response.json();
      setMessage(result.message);
      setMessageType(result.success ? "success" : "error");

      // Hide success or error message after 5 seconds
      if (result.success) {
        setTimeout(() => setMessage(""), 5000);
      } else {
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An unexpected error occurred.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <ChakraProvider>
      <Box maxW="md" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          開始処理
        </Heading>
        {message && (
          <Alert status={messageType} mb={6}>
            <AlertIcon />
            {message}
          </Alert>
        )}
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>グループ名・ハンドルネーム</FormLabel>
              <Input type="text" value={groupname} onChange={(e) => setGroupname(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>人数</FormLabel>
              <NumberInput defaultValue={1} min={1} max={8} value={playerCount} onChange={handlePlayerCountChange}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>難易度</FormLabel>
              <NumberInput defaultValue={1} min={1} max={10} value={difficulty} onChange={handleDifficultyChange}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Room ID</FormLabel>
              <Input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
            </FormControl>
            <Button colorScheme="teal" type="submit">
              登録
            </Button>
          </VStack>
        </Box>
      </Box>
    </ChakraProvider>
  );
};

export default GroupRegistrationForm;
