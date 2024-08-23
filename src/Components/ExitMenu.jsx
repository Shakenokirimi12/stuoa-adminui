import { useEffect, useState, useCallback } from "react";
import { Button, Table, Tbody, Td, Th, Thead, Tr, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, VStack, Spinner, Icon, Box } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrintCheckmark, setShowPrintCheckmark] = useState(false);
  const [showSnackCheckmark, setShowSnackCheckmark] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchGroups = useCallback(() => {
    setIsLoading(true);
    fetch(`http://${window.location.host}/api/adminui/groups/list`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setGroups(data.data);
        }
      })
      .catch((error) => console.error("Error fetching group data:", error))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchGroups();
    const interval = setInterval(fetchGroups, 5000);
    return () => clearInterval(interval);
  }, [fetchGroups]);

  const handleOptionsClick = useCallback(
    (group) => {
      setSelectedGroup(group);
      onOpen();
    },
    [onOpen]
  );

  const handlePrintCertificate = useCallback(() => {
    if (selectedGroup) {
      const endpoint = selectedGroup.WasCleared === 1 ? `http://${window.location.host}/api/adminui/groups/${selectedGroup.GroupId}/getCertificate` : `http://${window.location.host}/api/adminui/groups/${selectedGroup.GroupId}/getCertificate/re`;

      fetch(endpoint)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const fileURL = `http://${window.location.host}/api/adminui/getpdf/${data.filename}`;
            window.open(fileURL, "_blank");
            setShowPrintCheckmark(true);
            setTimeout(() => {
              onClose();
              setShowPrintCheckmark(false);
              fetchGroups();
            }, 1000);
          } else {
            console.error("Failed to retrieve the PDF file:", data.message);
          }
        })
        .catch((error) => console.error("Error fetching certificate data:", error));
    }
  }, [selectedGroup, onClose, fetchGroups]);

  const handleGiveSnackButton = useCallback(() => {
    if (selectedGroup) {
      const endpoint = `http://${window.location.host}/api/adminui/groups/${selectedGroup.GroupId}/giveSnack`;
      fetch(endpoint)
        .then((response) => response.json())
        .then((data) => {
          setShowSnackCheckmark(true);
          setTimeout(() => {
            onClose();
            setShowSnackCheckmark(false);
            fetchGroups();
          }, 1000);
        })
        .catch((error) => console.error("Error giving snack:", error));
    }
  }, [selectedGroup, onClose, fetchGroups]);

  const getSnackStatus = (snackState) => {
    if (snackState === -1) return { text: "受け取り済み", color: "gray" };
    if (snackState === 0) return { text: "受け取り物なし", color: "white" };
    return { text: `${snackState}個受け取り待ち`, color: "red" };
  };

  const sortedGroups = groups.sort((a, b) => {
    const aCertIsRed = a.WasCleared === 1;
    const aSnackIsRed = a.SnackState !== -1 && a.SnackState !== 0;
    const bCertIsRed = b.WasCleared === 1;
    const bSnackIsRed = b.SnackState !== -1 && b.SnackState !== 0;

    if (aCertIsRed && !bCertIsRed) return -1;
    if (!aCertIsRed && bCertIsRed) return 1;
    if (aSnackIsRed && !bSnackIsRed) return -1;
    if (!aSnackIsRed && bSnackIsRed) return 1;
    return 0;
  });

  return (
    <>
      {isLoading ? (
        <Spinner size="xl" />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>グループ名</Th>
              <Th>チャレンジ回数</Th>
              <Th>プレイヤー数</Th>
              <Th>証明書の状態</Th>
              <Th>お菓子</Th>
              <Th>オプション</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedGroups.map((group) => {
              const { text: snackText, color: snackColor } = getSnackStatus(group.SnackState);
              const certStatus = group.WasCleared === 1 ? "クリア(証明書未受領)" : group.WasCleared === 2 ? "受領済み" : "未クリア";
              const certColor = group.WasCleared === 1 ? "red" : "black";

              return (
                <Tr key={group.GroupId}>
                  <Td>{group.Name}</Td>
                  <Td>{group.ChallengesCount}</Td>
                  <Td>{group.PlayerCount}</Td>
                  <Td color={certColor}>{certStatus}</Td>
                  <Td color={snackColor}>{snackText}</Td>
                  <Td>
                    <Button colorScheme="blue" onClick={() => handleOptionsClick(group)} isDisabled={group.WasCleared === 0}>
                      オプション
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>オプション</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedGroup && (
              <VStack>
                <Box>
                  <Button colorScheme="blue" onClick={handlePrintCertificate}>
                    証明書を印刷する
                  </Button>
                  {showPrintCheckmark && <Icon as={CheckIcon} color="green.500" p={"4px"} />}
                </Box>
                <Box>
                  <Button colorScheme="blue" onClick={handleGiveSnackButton} isDisabled={selectedGroup.SnackState !== 3 && selectedGroup.SnackState !== 4 && selectedGroup.SnackState !== 5}>
                    {selectedGroup.SnackState === -1 ? "お菓子は受領済みです!" : selectedGroup.SnackState === 0 ? "お菓子を渡せる状態ではありません!" : "お菓子を渡す"}
                  </Button>
                  {showSnackCheckmark && <Icon as={CheckIcon} color="green.500" p={"4px"} />}
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupList;
