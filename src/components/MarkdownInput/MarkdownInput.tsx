import React, { useState } from "react";
import { Button, Input, Stack, InputProps, Box } from "@mui/material";
import Markdown from "react-markdown";
import { IoCheckmark, IoCreate } from "react-icons/io5";

export const MarkdownInput = (props: InputProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (isEdit) {
    return (
      <Stack flexDirection={"row"}>
        <Box flexGrow={1}>
          <Input {...props} fullWidth onBlur={() => setIsEdit(false)}></Input>
        </Box>
        <Box sx={{ padding: "6px" }}>
          <Button
            onClick={() => setIsEdit(false)}
            sx={{ width: "24px", minWidth: "24px", padding: "4px" }}
            variant="contained"
          >
            <IoCheckmark size={16} />
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack
      flexDirection={"row"}
      sx={{ background: "lightgrey", width: "100%", height: "36px", pl: "8px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Stack
        flexGrow={1}
        justifyContent={"center"}
        sx={{ width: "100%", height: "100%" }}
      >
        <Markdown unwrapDisallowed allowedElements={['em', 'strong', 'italic', 'p']}>
          {props.value as string}
        </Markdown>
      </Stack>
      {isHovered ? (
        <Box sx={{ padding: "6px" }}>
          <Button
            onClick={() => setIsEdit(true)}
            sx={{ width: "24px", minWidth: "24px", padding: "4px" }}
            variant="contained"
          >
            <IoCreate size={16} />
          </Button>
        </Box>
      ) : (
        <></>
      )}
    </Stack>
  );
};
