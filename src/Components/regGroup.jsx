import { useState, useEffect, useRef } from "react";
import { Box, Input, Button, FormControl, FormLabel, ChakraProvider, VStack, Heading, Alert, AlertIcon, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Text } from "@chakra-ui/react";
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from "@chakra-ui/react";
import Rooms from "./Rooms";

const GroupRegistrationForm = () => {
  const [groupname, setGroupname] = useState("");
  const [message, setMessage] = useState("");
  const [playerCount, setPlayerCount] = useState(1);
  const [difficulty, setDifficulty] = useState(1);
  const [messageType, setMessageType] = useState("");
  const [queue_number, setQueueNumber] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const queueNumberInputRef = useRef(null); // Add reference to the queue number input

  const handlePlayerCountChange = (value) => setPlayerCount(value);
  const handleDifficultyChange = (value) => setDifficulty(value);

  useEffect(() => {
    if (!queue_number && queueNumberInputRef.current) {
      queueNumberInputRef.current.focus(); // Focus on the queue number input if it's empty
    }
  }, [queue_number]);

  const handleSubmit = async (event, dupCheck = false) => {
    event.preventDefault();
    try {
      const response = await fetch(`http://${window.location.host}/api/adminui/regChallenge/auto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          GroupName: groupname,
          playerCount: playerCount,
          difficulty: difficulty,
          dupCheck: dupCheck,
          queueNumber: queue_number,
        }),
      });

      const result = await response.json();
      if (!result.success && result.message.includes("dupCheck")) {
        setMessage("同じグループ名が存在します。過去にプレイしたことがあるかを確認し、ある場合は「はい」を、そうでなく、新しいグループ名の場合は「いいえ」を選択し、新しくグループ名を入力してください。");
        setMessageType("warning");
        onOpen();
        return;
      }

      setMessage(result.message);
      setMessageType(result.success ? "success" : "error");

      if (result.success) {
        setGroupname("");
        setPlayerCount(1);
        setDifficulty(1);
        setQueueNumber("");
      }

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setMessage("An unexpected error occurred.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleRetry = () => {
    handleSubmit(new Event("submit"), true).then(() => {
      onClose();
    });
  };

  return (
    <ChakraProvider>
      <Box maxW="md" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          開始登録
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
              <FormLabel>整理番号</FormLabel>
              <Input
                ref={queueNumberInputRef} // Attach the reference to the input field
                type="text"
                value={queue_number}
                onChange={(e) => setQueueNumber(e.target.value)}
              />
            </FormControl>
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
              <NumberInput defaultValue={1} min={1} max={4} value={difficulty} onChange={handleDifficultyChange}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Button colorScheme="teal" type="submit">
              登録
            </Button>
          </VStack>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>警告</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>{message}</Text>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleRetry}>
                はい
              </Button>
              <Button variant="ghost" onClick={onClose}>
                いいえ
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
      <Rooms />
    </ChakraProvider>
  );
};

export default GroupRegistrationForm;
