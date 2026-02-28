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
  Badge,
  useMediaQuery,
  useTheme,
  Toolbar,
  Divider,
} from "@mui/material";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import StarIcon from "@mui/icons-material/Star";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useBundles } from "@/lib/hooks/useBundles";
import BundleTree from "@/components/bundles/BundleTree";
import type { NoteView } from "@/lib/types";

const DRAWER_WIDTH = 280;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  activeBundleId: string | null;
  activeView: NoteView;
  onSelectBundle: (bundleId: string | null) => void;
  onSelectView: (view: NoteView) => void;
  onCreateBundle: (parentId: string | null) => void;
  counts: { active: number; favorites: number; archived: number; trash: number };
}

export default function Sidebar({
  open,
  onClose,
  activeBundleId,
  activeView,
  onSelectBundle,
  onSelectView,
  onCreateBundle,
  counts,
}: SidebarProps) {
  const { tree, loading } = useBundles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleNavClick = (view: NoteView) => {
    onSelectView(view);
    if (view !== "active") {
      onSelectBundle(null);
    }
    if (isMobile) onClose();
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar />
      <Box sx={{ px: 1, pt: 1, flexGrow: 1, overflow: "auto" }}>
        <List disablePadding>
          <ListItemButton
            selected={activeView === "active" && activeBundleId === null}
            onClick={() => {
              onSelectBundle(null);
              handleNavClick("active");
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
            <Badge
              badgeContent={counts.active}
              color="primary"
              max={999}
              sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", height: 18, minWidth: 18 } }}
            />
          </ListItemButton>

          <ListItemButton
            selected={activeView === "favorites"}
            onClick={() => handleNavClick("favorites")}
            sx={{ mx: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <StarIcon fontSize="small" sx={{ color: activeView === "favorites" ? "warning.main" : undefined }} />
            </ListItemIcon>
            <ListItemText
              primary="Favorites"
              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
            />
            {counts.favorites > 0 && (
              <Badge
                badgeContent={counts.favorites}
                color="warning"
                max={999}
                sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", height: 18, minWidth: 18 } }}
              />
            )}
          </ListItemButton>

          <ListItemButton
            selected={activeView === "archived"}
            onClick={() => handleNavClick("archived")}
            sx={{ mx: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ArchiveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Archive"
              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
            />
            {counts.archived > 0 && (
              <Badge
                badgeContent={counts.archived}
                color="default"
                max={999}
                sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", height: 18, minWidth: 18 } }}
              />
            )}
          </ListItemButton>

          <ListItemButton
            selected={activeView === "trash"}
            onClick={() => handleNavClick("trash")}
            sx={{ mx: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <DeleteIcon fontSize="small" sx={{ color: activeView === "trash" ? "error.main" : undefined }} />
            </ListItemIcon>
            <ListItemText
              primary="Trash"
              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
            />
            {counts.trash > 0 && (
              <Badge
                badgeContent={counts.trash}
                color="error"
                max={999}
                sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", height: 18, minWidth: 18 } }}
              />
            )}
          </ListItemButton>
        </List>

        <Divider sx={{ my: 1, mx: 2 }} />

        <Typography
          variant="overline"
          sx={{ px: 2, pt: 1, pb: 1, display: "block", color: "text.secondary" }}
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
              onSelectView("active");
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
