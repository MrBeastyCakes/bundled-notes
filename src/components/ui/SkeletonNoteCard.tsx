"use client";

import { Card, CardContent, Skeleton, Box } from "@mui/material";

export default function SkeletonNoteCard() {
  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="circular" width={16} height={16} />
        </Box>
        <Skeleton variant="text" width="90%" height={18} sx={{ mt: 0.5 }} />
        <Skeleton variant="text" width="70%" height={18} />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.5 }}>
          <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: 2 }} />
          <Skeleton variant="text" width={50} height={16} />
        </Box>
      </CardContent>
    </Card>
  );
}
