import { useState, useEffect } from "react";
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, useToast } from "@chakra-ui/react";

const ErrorManagementPage = () => {
  const [errors, setErrors] = useState([]);
  const toast = useToast();

  // Polling every 1 second to check for unresolved errors
  useEffect(() => {
    const interval = setInterval(() => {
      fetchErrorHistory();
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  });

  // Fetch the error history
  const fetchErrorHistory = async () => {
    try {
      const response = await fetch(`http://${window.location.host}/api/adminui/errorHistory`);
      const data = await response.json();
      setErrors(data);
    } catch (err) {
      console.error("Error fetching error history:", err);
    }
  };

  useEffect(() => {
    fetchErrorHistory();
  }, []);

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
        fetchErrorHistory(); // Refresh the error history
      } else {
        console.error("Error resolving error:", response.statusText);
      }
    } catch (err) {
      console.error("Error resolving error:", err);
    }
  };

  return (
    <Box p={5}>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>エラーID</Th>
            <Th>内容</Th>
            <Th>場所</Th>
            <Th>発生日時</Th>
            <Th>解決済み？</Th>
            <Th>操作</Th>
          </Tr>
        </Thead>
        <Tbody>
          {errors.map((error) => (
            <Tr key={error.ErrorId}>
              <Td>{error.ErrorId}</Td>
              <Td>{error.Description}</Td>
              <Td>{error.FromWhere}</Td>
              <Td>{error.ReportedTime}</Td>
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
    </Box>
  );
};

export default ErrorManagementPage;
