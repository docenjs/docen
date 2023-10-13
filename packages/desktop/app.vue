<script setup lang="ts">
import { getMatches } from "@tauri-apps/api/cli";

getMatches().then((matches) => {
  // do something with the { args, subcommand } matches
  const { args, subcommand } = matches;

  console.log({ args, subcommand });
});
</script>

<template>
  <div></div>
</template>
