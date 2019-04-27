<template>
  <b-navbar toggleable="lg" type="light" fill>
    <b-navbar-brand to="/">
      <img src="../assets/logo.svg" alt="SQID logo">
      SQID
    </b-navbar-brand>
    <b-navbar-toggle target="mainNavbar" />
    <b-collapse is-nav id="mainNavbar">
      <b-navbar-nav id="mainNavbar" class="justify-content-end flex-grow-1">
        <app-navbar-search-box class="w-25" />
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
        { target: {name: 'home'}, label: 'Start', exact: true },
        { target: '/classes', label: 'Classes' },
        { target: '/properties', label: 'Properties' },
        { target: '/lexemes', label: 'Lexemes' },
        { target: '/rules', label: 'Rules' },
        { target: {name: 'about'}, label: 'About' },
    ]
}
</script>
