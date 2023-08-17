<template>
  <sqid-navbar />
  <main>
    <router-view />
  </main>
  <sqid-footer />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

// todo(mx0): maybe load translation here?
</script>

<style lang="less">
:root {
  --red: #990000;
  --green: #339966;
  --blue: #006699;
  --grey: #484848;
}

#nav {
  font-weight: bold;
  padding-bottom: 1em;

  a {
    color: var(--blue);

    &:hover {
      color: var(--red);
      text-decoration: underline;
    }

    &.active {
      color: var(--green);
    }
  }
}
</style>
