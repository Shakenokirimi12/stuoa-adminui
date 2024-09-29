import { useEffect, useState } from "react";
import { Box, Text, VStack, Spinner, useDisclosure, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { motion } from "framer-motion";

const Rankings = () => {
  const [difficulty, setDifficulty] = useState(1);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen } = useDisclosure();

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://${window.location.host}/api/cleartimes?difficulty=${difficulty}`);
        const data = await response.json();
        if (data.success) {
          setRankings(data.data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching rankings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [difficulty]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDifficulty((prev) => (prev < 4 ? prev + 1 : 1));
      onOpen();
    }, 20000); // 20 seconds interval

    return () => clearInterval(interval);
  }, [onOpen]);

  const animationVariants = {
    initial: { opacity: 0, y: -20 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  // Function to convert elapsed time to "X分 Y秒"
  const formatElapsedTime = (elapsedTime) => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes}分 ${seconds}秒`;
  };

  return (
    <Box p={5} textAlign="center" bgColor="teal.500" color="white" height="100vh" display="flex" flexDirection="column" justifyContent="center">
      <Text fontSize="6xl" mb={4}>
        {" "}
        {/* Increased font size */}
        難易度: {difficulty === 1 ? "初級" : difficulty === 2 ? "中級" : difficulty === 3 ? "上級" : "超級"}
      </Text>
      {loading ? (
        <Spinner size="xl" color="white" />
      ) : (
        <VStack spacing={4} align="center">
          <motion.div initial="initial" animate={isOpen ? "enter" : "exit"} variants={animationVariants} transition={{ duration: 0.5 }}>
            {rankings.length > 0 ? (
              <Table variant="striped" colorScheme="whiteAlpha" size="lg" mt={4}>
                <Thead>
                  <Tr>
                    <Th fontSize="2xl">順位</Th> {/* Increased font size */}
                    <Th fontSize="2xl">グループ名</Th> {/* Increased font size */}
                    <Th fontSize="2xl">経過時間</Th> {/* Increased font size */}
                    <Th fontSize="2xl">難易度</Th> {/* Increased font size */}
                  </Tr>
                </Thead>
                <Tbody>
                  {rankings.slice(0, 10).map(
                    (
                      rank,
                      index // Limit to top 10
                    ) => (
                      <Tr key={index}>
                        <Td fontSize="2xl">{index + 1}</Td> {/* Increased font size */}
                        <Td fontSize="2xl">{rank.GroupName}</Td> {/* Increased font size */}
                        <Td fontSize="2xl">{formatElapsedTime(rank.ElapsedTime)}</Td> {/* Increased font size */}
                        <Td fontSize="2xl">{rank.Difficulty}</Td> {/* Increased font size */}
                      </Tr>
                    )
                  )}
                </Tbody>
              </Table>
            ) : (
              <Text fontSize="3xl" color="gray.800">
                挑戦者がいないようです...
                <br />
                挑戦してランキングに名前を載せましょう！
              </Text>
            )}
          </motion.div>
        </VStack>
      )}
    </Box>
  );
};

export default Rankings;
