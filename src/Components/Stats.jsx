import { useState, useEffect } from "react";
import { Box, SimpleGrid, Text, Switch, HStack, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { Chart } from "react-google-charts";

const Stats = () => {
  const [questions, setQuestions] = useState([]);
  const [displayMode, setDisplayMode] = useState({});

  useEffect(() => {
    // Fetch questions data from the API
    fetch(`http://${window.location.host}/api/adminui/stats/Questions`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const fetchAnswerPromises = data.data.map((question) =>
            fetch(`http://${window.location.host}/api/adminui/stats/${question.ID}`)
              .then((response) => response.json())
              .then((answerData) => {
                if (answerData.success) {
                  return { ...question, challengerAnswers: answerData.data };
                }
                return question;
              })
          );

          Promise.all(fetchAnswerPromises).then((updatedQuestions) => {
            updatedQuestions.sort((a, b) => a.ID.localeCompare(b.ID));
            setQuestions(updatedQuestions);
          });
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const countAnswers = (answers) => {
    const counts = {};
    answers.forEach((answer) => {
      const { ChallengerAnswer } = answer;
      counts[ChallengerAnswer] = (counts[ChallengerAnswer] || 0) + 1;
    });
    return Object.entries(counts).map(([answer, count]) => [answer, count]);
  };

  const toggleDisplayMode = (id) => {
    setDisplayMode((prevMode) => ({
      ...prevMode,
      [id]: prevMode[id] === "image" ? "graph" : "image",
    }));
  };

  return (
    <Box>
      <SimpleGrid columns={[1, 2]} spacing={4}>
        {questions.map((question) => {
          const { ID, Difficulty, CollectCount, WrongCount, challengerAnswers = [] } = question;
          const mode = displayMode[ID] || "graph";
          const answerCounts = countAnswers(challengerAnswers);
          const correctRate = ((CollectCount / (CollectCount + WrongCount)) * 100).toFixed(2);

          const challengerChartData = [["Answer", "Count"], ...answerCounts];
          const resultChartData = [
            ["Answer", "Count"],
            ["正答", CollectCount],
            ["誤答", WrongCount],
          ];

          return (
            <Box key={ID} borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} minHeight="500px">
              <HStack justifyContent="space-between" mb={2}>
                <Text fontSize="xl" as='b'>{ID}</Text>
                <HStack>
                  <Text fontSize="sm">グラフ表示</Text>
                  <Switch
                    isChecked={mode === "image"}
                    onChange={() => toggleDisplayMode(ID)}
                    size="md"
                    colorScheme="teal"
                  />
                  <Text fontSize="sm">問題表示</Text>
                </HStack>
              </HStack>
              <Box height="250px">
                {mode === "graph" ? (
                  <SimpleGrid columns={2} spacing={4} height="100%">
                    <Chart
                      chartType="PieChart"
                      data={challengerChartData}
                      width={"100%"}
                      height={"100%"}
                      options={{
                        title: "答えの割合",
                        pieHole: 0.4,
                      }}
                    />
                    <Chart
                      chartType="PieChart"
                      data={resultChartData}
                      width={"100%"}
                      height={"100%"}
                      options={{
                        title: "正答率",
                        pieHole: 0.4,
                      }}
                    />
                  </SimpleGrid>
                ) : (
                  <Box height="100%" display="flex" alignItems="center" justifyContent="center">
                    <img
                      src={`http://${window.location.host}/api/client/getfile/${ID}.png`}
                      alt={`${ID} question`}
                      style={{ maxHeight: "100%", maxWidth: "100%" }}
                    />
                  </Box>
                )}
              </Box>
              <Table mt={4} size="sm">
                <Thead>
                  <Tr>
                    <Th>難易度</Th>
                    <Th>正答率</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>{Difficulty}</Td>
                    <Td>{correctRate}%</Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

export default Stats;
