<template>
  <header id="nav">
    <b-navbar toggleable="lg" type="light" fill>
      <b-navbar-brand to="/">
        <img src="../assets/logo.svg" alt="SQID logo" />
        <span style="color: var(--green)">{{ t('pageTitle.sqidS') }}</span
        ><span style="color: var(--red)">{{ t('pageTitle.sqidQ') }}</span
        ><span style="color: var(--green)">{{ t('pageTitle.sqidI') }}</span
        ><span style="color: var(--blue)">{{ t('pageTitle.sqidD') }}</span>
      </b-navbar-brand>
      <b-navbar-toggle target="mainNavbar" />
      <b-collapse id="mainNavbar" is-nav>
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
import { useI18n } from 'vue-i18n'

const navlinks = [
  { target: { name: 'home' }, message: 'pageTitle.start', exact: true },
  { target: '/classes', message: 'pageTitle.classes' },
  { target: '/properties', message: 'pageTitle.properties' },
  //      { target: '/lexemes', message: 'pageTitle.lexemes' },
  { target: '/rules', message: 'pageTitle.rules' },
  { target: { name: 'about' }, message: 'pageTitle.about' },
]

const { t } = useI18n()
</script>
