"use client";

import { Box, Typography } from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

export default function TrashBanner() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        bgcolor: "error.main",
        color: "error.contrastText",
        borderRadius: 3,
        mx: 2,
        mt: 1,
      }}
    >
      <DeleteSweepIcon fontSize="small" />
      <Typography variant="body2" fontWeight={500}>
        Items in trash are permanently deleted after 30 days
      </Typography>
    </Box>
  );
}
