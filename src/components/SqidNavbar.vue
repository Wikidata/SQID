<template>
  <header id="nav">
    <b-navbar toggleable="lg" type="light" fill>
      <b-navbar-brand to="/">
        <img src="../assets/logo.svg" alt="SQID logo" />
        SQID
      </b-navbar-brand>
      <b-navbar-toggle target="mainNavbar" />
      <b-collapse is-nav id="mainNavbar">
        <b-navbar-nav class="justify-content-end flex-grow-1">
          <!--<sqid-navbar-search-box class="w-25" /> -->
          <sqid-navbar-navlinks :navlinks="navlinks" />
          <sqid-navbar-login />
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </header>
</template>

<script setup lang="ts">
const navlinks = [
  { target: { name: 'home' }, message: 'pageTitle.start', exact: true },
  { target: '/classes', message: 'pageTitle.classes' },
  { target: '/properties', message: 'pageTitle.properties' },
  //      { target: '/lexemes', message: 'pageTitle.lexemes' },
  { target: '/rules', message: 'pageTitle.rules' },
  { target: { name: 'about' }, message: 'pageTitle.about' },
]
</script>
