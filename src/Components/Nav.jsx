"use client";
import { Box, Flex, HStack, IconButton, Button, Menu, MenuButton, useDisclosure, useColorModeValue, Stack, Image } from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import icon from "./images/icon.png";

// English links with Japanese labels
const Links = [
  { label: "ホーム", href: "Home" },
  { label: "開始登録", href: "Register" },
  { label: "ルーム一覧", href: "Rooms" },
  { label: "エラー管理", href: "Errors" },
  { label: "統計情報", href: "Stats" },
  { label: "退出メニュー", href: "ExitMenu" },
  { label: "ルーム状況", href: "roomStatus" },
];

const NavLink = ({ label, href }) => {
  return (
    <Box
      as="a"
      px={2}
      py={1}
      rounded={"md"}
      _hover={{
        textDecoration: "none",
        bg: useColorModeValue("gray.200", "gray.700"),
      }}
      href={href}
    >
      {label}
    </Box>
  );
};

export default function WithAction() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton size={"md"} icon={isOpen ? <CloseIcon /> : <HamburgerIcon />} aria-label={"Open Menu"} display={{ md: "none" }} onClick={isOpen ? onClose : onOpen} />
          <HStack spacing={8} alignItems={"center"}>
            <Image width="100px" src={icon} alt="Logo" />
            <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
              {Links.map((link) => (
                <NavLink key={link.href} label={link.label} href={link.href} />
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <Menu>
              <MenuButton as={Button} rounded={"full"} variant={"link"} cursor={"pointer"} minW={0}></MenuButton>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link.href} label={link.label} href={link.href} />
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
