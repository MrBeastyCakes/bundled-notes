"use client";

import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  Toolbar,
} from "@mui/material";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import AddIcon from "@mui/icons-material/Add";
import { useBundles } from "@/lib/hooks/useBundles";
import BundleTree from "@/components/bundles/BundleTree";

const DRAWER_WIDTH = 280;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  activeBundleId: string | null;
  onSelectBundle: (bundleId: string | null) => void;
  onCreateBundle: (parentId: string | null) => void;
}

export default function Sidebar({
  open,
  onClose,
  activeBundleId,
  onSelectBundle,
  onCreateBundle,
}: SidebarProps) {
  const { tree, loading } = useBundles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar />
      <Box sx={{ px: 1, pt: 1, flexGrow: 1, overflow: "auto" }}>
        <List disablePadding>
          <ListItemButton
            selected={activeBundleId === null}
            onClick={() => {
              onSelectBundle(null);
              if (isMobile) onClose();
            }}
            sx={{ mx: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AllInboxIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="All Notes"
              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
            />
          </ListItemButton>
        </List>

        <Typography
          variant="overline"
          sx={{ px: 2, pt: 2, pb: 1, display: "block", color: "text.secondary" }}
        >
          Bundles
        </Typography>

        {loading ? (
          <Typography variant="body2" sx={{ px: 2, color: "text.secondary" }}>
            Loading...
          </Typography>
        ) : tree.length === 0 ? (
          <Typography variant="body2" sx={{ px: 2, color: "text.secondary" }}>
            No bundles yet
          </Typography>
        ) : (
          <BundleTree
            nodes={tree}
            activeBundleId={activeBundleId}
            onSelectBundle={(id) => {
              onSelectBundle(id);
              if (isMobile) onClose();
            }}
            onCreateSubBundle={onCreateBundle}
          />
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => onCreateBundle(null)}
          sx={{ borderRadius: 20 }}
        >
          New Bundle
        </Button>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? open : true}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          bgcolor: "background.default",
          borderRight: 1,
          borderColor: "divider",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
