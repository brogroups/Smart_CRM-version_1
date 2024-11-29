<template>
    <div v-if="showNakladnoy" class="nakladnoy-modal">
      <div class="nakladnoy-content">
        <div class="d-flex column gap16">
          <h2 class="d-flex j-center">Накладной</h2>
          
        </div>
        <div class="d-flex column gap24">
          <div class="d-flex j-between">
            <div class="d-flex column gap12">
              <p><strong>Имя клиента:</strong> {{ product?.clientName }}</p>
              <p><strong>Телефон:</strong>{{product?.phone|| '---'}}</p>
            </div>
            <div class="d-flex column gap12">
              <p><strong>Имя клиента:</strong>Trendy_socks</p>
              <p><strong>Телефон:</strong>+998997263192</p>
            </div>
          </div>
          <p><strong>Дата:</strong> {{ formatDate(product?.date) }}</p>
          <table>
            <thead>
              <tr>
                  <th>Имя продукти</th>
                  <th>Цена</th>
                  <th>Количество</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in product.products" :key="item.index">
                  <td>{{item.code}}</td>
                  <td>{{formatSumma(item.price)}}</td>
                  <td>{{item.quantity}} x</td>
                  <td>{{formatSumma(item.price*item.quantity)}}</td>
                </tr>
              </tbody>
          </table>
        </div>
        <div class="d-flex">
          <div class=" d-flex column gap12">
            <p>
              <strong>Общая сумма:</strong>
              {{ formatSumma(product?.totalPrice) }}
            </p>
            <p><strong>Общий долг</strong>{{formatSumma(product?.debts)}}</p>
          </div>
        </div>
        <div class="controll-button d-flex j-center gap12">
            <button @click="closeNakladnoy($event)">Закрыть</button>
            <button @click="printNakladnoy">Печать</button>
        </div>
      </div>
    </div>
    <div class="bottom p24 d-flex column gap6 warehouse-bottom">
      <div
        v-for="data in listSale"
        :key="data?._id"
        class="apache d-flex flex1 a-center"
      >
        <Icons name="print" class="info" @click="showNakladnoyPreview(data)" />
        <Icons name="deleted" class="danger" @click="deleted(data._id)" />
      </div>
    </div>
</template>

<script>
export default {
  name: "NakladnoyPage",
  props: {
    client: {
      type: Object,
    },
    product: {
      type: Object,
    },
    showNakladnoy: {
        type:Boolean,
        default:false
    }
  },
  emits: ['close'],
  data() {
    return {
      selectedSale: null,
    };
  },
  methods: {
    showNakladnoyPreview(data) {
      this.selectedSale = data;
    },
    closeNakladnoy() {
      this.$emit('close')
    },
    printNakladnoy() {
      window.print();
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString("ru-RU");
    },
    formatSumma(summa) {
      return new Intl.NumberFormat("ru-RU").format(summa);
    },
  },
};
</script>

<style scoped>
.nakladnoy-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nakladnoy-content {
  padding: 20px;
  border-radius: 8px;
  width: 60%;
  height: 80%;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.controll-button>button{
    width: 100px;
    padding: 12px;
    color: #fff;
    border-radius:4px;
    cursor: pointer;
}
.controll-button>button:last-child{
    background: #5565FF;
}
.controll-button>button:first-child{
    background: none;
    border: 1px solid #fff;
    color: red;
}
.controll-button>button:first-child:hover{
    border:1px solid red;
}
</style>
