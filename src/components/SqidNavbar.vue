<template>
  <header id="nav">
    <b-navbar toggleable="lg" type="light" fill>
      <b-navbar-brand to="/">
        <img src="../assets/logo.svg" alt="SQID logo" />
        <span style="color: var(--green)">S</span><span style="color: var(--red)">Q</span
        ><span style="color: var(--green)">I</span><span style="color: var(--blue)">D</span>
      </b-navbar-brand>
      <b-navbar-toggle target="mainNavbar" />
      <b-collapse is-nav id="mainNavbar">
        <b-navbar-nav class="nav-tabs justify-content-end flex-grow-1">
          <sqid-navbar-search-box class="me-2" />
          <sqid-navbar-navlinks :navlinks />
          <sqid-navbar-language class="mx-2" />
          <sqid-navbar-theme />
          <sqid-navbar-login class="ms-2" />
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
