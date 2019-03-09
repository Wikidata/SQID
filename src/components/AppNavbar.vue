<template>
  <b-navbar toggleable="lg" type="light">
    <b-navbar-brand href="#">
      <img src="../assets/logo.svg" alt="SQID logo">
      SQID
    </b-navbar-brand>
    <b-navbar-toggle target="mainNavbar" />
    <b-collapse is-nav id="mainNavbar">
      <b-navbar-nav id="mainNavbar" class="ml-auto">
        <app-navbar-search-box />
        <app-navbar-navlinks :navlinks="navlinks" />
        <app-navbar-login />
      </b-navbar-nav>
    </b-collapse>
</b-navbar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AppNavbarSearchBox from './AppNavbarSearchBox.vue'
import { AppNavbarNavlinks, Navlink } from './AppNavbarNavlinks.vue'
import AppNavbarLogin from './AppNavbarLogin.vue'

@Component({
    components: {
        'app-navbar-search-box': AppNavbarSearchBox,
        'app-navbar-navlinks': AppNavbarNavlinks,
        'app-navbar-login': AppNavbarLogin,
    }})
export default class AppNavbar extends Vue {
    private navlinks: Navlink[] = [
        { target: '/', label: 'Start', exact: true },
        { target: '/classes', label: 'Classes' },
        { target: '/properties', label: 'Properties' },
        { target: '/lexemes', label: 'Lexemes' },
        { target: '/rules', label: 'Rules' },
        { target: '/about', label: 'About' },
    ]
}
</script>
