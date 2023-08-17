<template>
  <b-container>
    <b-row>
      <b-col class="mainbar" lg="9" md="12" sm="12">
        <slot name="mainbar" />
      </b-col>
      <b-col class="sidebar" lg="3" md="12" sm="12">
        <slot name="sidebar" />
      </b-col>
    </b-row>
  </b-container>
</template>

<style lang="less">
.mainbar {
  margin-right: -1px;
  margin-bottom: 10px;
  border-right: 1px solid #ddd;
  padding-right: 5px;
  border-style: collapse;
}
.sidebar {
  margin-bottom: 10px;
  border-left: 1px solid #ddd;
  padding-left: 5px;
  border-style: collapse;
}
</style>
