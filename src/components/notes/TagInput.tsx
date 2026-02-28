"use client";

import { useState } from "react";
import { Box, Chip, TextField, Autocomplete } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

interface TagInputProps {
  tags: string[];
  allTags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, allTags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <Autocomplete
      multiple
      freeSolo
      size="small"
      options={allTags.filter((t) => !tags.includes(t))}
      value={tags}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={(_, newValue) => {
        const cleaned = newValue
          .map((v) => v.trim().toLowerCase())
          .filter((v) => v.length > 0);
        onChange([...new Set(cleaned)]);
        setInputValue("");
      }}
      renderTags={(value, getTagProps) =>
        value.map((tag, index) => {
          const { key, ...rest } = getTagProps({ index });
          return (
            <Chip
              key={key}
              label={tag}
              size="small"
              icon={<LocalOfferIcon sx={{ fontSize: 14 }} />}
              {...rest}
              sx={{ borderRadius: 2 }}
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: 3, py: 0.5 },
          }}
        />
      )}
      sx={{ minWidth: 200 }}
    />
  );
}

interface TagFilterBarProps {
  allTags: string[];
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export function TagFilterBar({ allTags, activeTag, onSelectTag }: TagFilterBarProps) {
  if (allTags.length === 0) return null;

  return (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
      {allTags.map((tag) => (
        <Chip
          key={tag}
          label={tag}
          size="small"
          icon={<LocalOfferIcon sx={{ fontSize: 14 }} />}
          variant={activeTag === tag ? "filled" : "outlined"}
          color={activeTag === tag ? "primary" : "default"}
          onClick={() => onSelectTag(activeTag === tag ? null : tag)}
          sx={{ borderRadius: 2, cursor: "pointer" }}
        />
      ))}
    </Box>
  );
}
