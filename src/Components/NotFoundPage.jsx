import { ChakraProvider, Box, Heading, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <ChakraProvider>
      <Box textAlign="center" py={10} px={6}>
        <VStack spacing={6}>
          <Heading display="inline-block" as="h2" size="2xl" bgGradient="linear(to-r, teal.400, teal.600)" backgroundClip="text">
            404
          </Heading>
          <Text fontSize="18px" mt={3} mb={2}>
            Page Not Found
          </Text>
          <Text color={"gray.500"} mb={6}>
            The page you're looking for does not seem to exist.
          </Text>
          <Link to="/">Click here to back to home</Link>
        </VStack>
      </Box>
    </ChakraProvider>
  );
};

export default NotFoundPage;
