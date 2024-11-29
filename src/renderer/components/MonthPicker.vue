<template>
    <div class="month-picker">
        <select v-model="selectedMonth" @change="emitMonth">
          <option value="">Oy tanlang:</option>
        <option v-for="(month, index) in months" :key="index" :value="index + 1">
          {{ month }}
        </option>
      </select>
    </div>
  </template>
  
  <script>
  export default {
    name: "MonthPicker",
    data() {
      return {
        // Oylik variantlar ro'yxati
        months: [
          "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
          "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
        ],
        selectedMonth: '',
      };
    },
    methods: {
      emitMonth() {
        this.$emit("month-selected", this.selectedMonth);
      },
    },
  };
  </script>
  
  <style scoped>
  .month-picker {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  select {
    width: 100%;
    font-size: 14px !important;
    padding: 8px;
    font-size: 16px;
  }
  </style>
  