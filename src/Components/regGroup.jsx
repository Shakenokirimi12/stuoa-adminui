import { useState } from "react";
import { Box, Input, Button, FormControl, FormLabel, ChakraProvider, VStack, Heading, Alert, AlertIcon, Select, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Text} from "@chakra-ui/react";
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from "@chakra-ui/react";

const GroupRegistrationForm = () => {
  const [groupname, setGroupname] = useState("");
  const [message, setMessage] = useState("");
  const [playerCount, setPlayerCount] = useState(1);
  const [difficulty, setDifficulty] = useState(1);
  const [roomId, setRoomId] = useState("");
  const [messageType, setMessageType] = useState("");
  const [dupCheckValue, setDupCheckValue] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

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
          GroupName: groupname,
          playerCount: playerCount,
          difficulty: difficulty,
          dupCheck: dupCheckValue,
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
        setRoomId("");
        setPlayerCount(1);
        setDifficulty(1);
        setDupCheckValue(false);
      }

      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Error:", error);
      setMessage("An unexpected error occurred.");
      setMessageType("error");
      setDupCheckValue(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleRetry = () => {
    setDupCheckValue(true);
    onClose();
    handleSubmit(new Event("submit"));
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
              <NumberInput defaultValue={1} min={1} max={4} value={difficulty} onChange={handleDifficultyChange}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>ルームID</FormLabel>
              <Select placeholder="ルームIDを選択" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </Select>
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
    </ChakraProvider>
  );
};

export default GroupRegistrationForm;
