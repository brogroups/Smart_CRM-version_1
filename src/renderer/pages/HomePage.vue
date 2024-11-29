<template>
  <div class="home-banner ">
    <div class="home-banner-top">
      <div class="d-flex j-between wrap gap24">
        <div class="item radius1 curs" @click="handleOpenHistory('incr')">
          <Icons name="allIncr" />
          <div class="d-flex column">
            <p class="gray text12">Общая поступлений</p>
            <h2 class="text16">{{ formatSumma(allStatistics?.globalIncrements || 0)  }}</h2>
          </div>
        </div>
        
        <div class="item radius1 curs">
          <Icons name="monthIncr" />
          <div class="d-flex column">
            <p class="gray text12">Ежемесячная поступлений</p>
            <h2 class="text16">{{ formatSumma(allStatistics?.monthIncrements || 0)  }}</h2>
          </div>
        </div>
        <div class="item radius1 curs">
          <Icons name="dayIncr" />
          <div class="d-flex column">
            <p class="gray text12">Ежедневная поступлений</p>
            <h2 class="text16">{{ formatSumma(allStatistics?.dayIncrements || 0)  }}</h2>
          </div>
        </div>

        <div class="item radius1 curs" @click="handleOpenHistory('decr')">
          <Icons name="allDecr" />
          <div class="d-flex column">
            <p class="gray text12">Общая расходов</p>
            <h2 class="text16">{{ formatSumma(allStatistics?.globalDecrements || 0)  }}</h2>
          </div>
        </div>
        
        <div class="item radius1 curs">
          <Icons name="monthDecr" />
          <div class="d-flex column">
            <p class="gray text12">Ежемесячная расходов</p>
            <h2 class="text16">{{ formatSumma(allStatistics?.monthDecrements || 0)  }}</h2>
          </div>
        </div>
        <div class="item radius1 curs">
          <Icons name="dayDecr" />
          <div class="d-flex column">
            <p class="gray text12">Ежедневная расходов</p>
            <h2 class="text16">{{ formatSumma(allStatistics?.dayDecrements || 0)  }}</h2>
          </div>
        </div>
        <div class="item radius1 curs" @click="handleOpenHistory('pending')">
          <Icons name="pending"  />
          <div class="d-flex column">
            <p class="gray text12">Ожидаемая сумма</p>
            <h2 class="text16">{{ formatSumma(allStatistics?.globalExpected || 0)  }}</h2>
          </div>
        </div>
        <div class="item radius1 curs">
          <Icons name="wallet" />
          <div class="d-flex column">
            <p class="gray text12">Кошелёк</p>
            <h2 class="text16">{{ formatSumma(allStatistics?.wallet || 0)  }}</h2>
          </div>
        </div>
        
        <div class="item radius1 curs">
          <Icons name="allPrice" />
          <div class="d-flex column">
            <p class="gray text12">Общая задолженность перед компаниями</p>
            <h2 class="text16">{{ formatSumma(allStatistics?.debtsFromFirm||0) }}</h2>
          </div>
        </div>
        <!-- <div class="item radius1 curs">
            <Icons name="allDebts"/>
            <div class="d-flex column">
              <p class="gray text12">All Incr</p>
              <h2 class="text16">12322232136178</h2>
            </div>
          </div>

          <div class="item radius1 curs">
            
          </div>
          <div class="item radius1 curs">
          </div> -->

      </div>
    </div>
    <div class="home-banner-bottom relative scroll  p12 gap12">
      <div class="d-flex border1 date radius1  gap12 j-end">  
        <DatePicker placeholder="Выберите день" @dateSelected="currentData = $event" :writeDay="currentData" />
      </div>
      <div class="border-bottom"></div>
      <div class="bottom-content">
        <table>
          <thead>
            <tr>
              <th>Причина</th>
              <th>Дата</th>
              <th>Сумма</th>
              <th>Специалист</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="data in filteredNotifications" :key="data.index">
              <td>{{ data?.action }}</td>
              <td>{{ formatDate(data?.date) }}</td>
              <td>{{ data?.price ? formatSumma(data?.price) : '--' }}</td>
              <td>{{ data?.worker?.slice(0, 13) || '--' }}</td>
              <td>{{ data?.description?.slice(0, 30) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!filteredNotifications?.length" class="d-flex j-center p12 text16">Уведомления пока нет</div>
      </div>
    </div>
  </div>
  <HistoryHome :open="isOpen" @close="isOpen=false"/>
  <HistoryDecrement :open="isRasxod" @close="isRasxod=false"/>
  <Pending :open="pending" @close="pending=false"/>
  </template>
<script>
import DatePicker from '../components/DatePicker.vue';
import Icons from '../components/Icons.vue';
import { ipcRenderer } from 'electron';
import eventNames from '@/universal/eventNames';
import HistoryHome from '../utils/HistoryHome.vue'
import HistoryDecrement from '../utils/HistoryDecrement.vue';
import Pending from '../utils/Pending.vue';
export default {
  components: {
    Icons,
    DatePicker,
    HistoryHome,
    HistoryDecrement,
    Pending,
  },
  data() {
    return {
      allStatistics: {},
      allNotification:[],
      currentData:new Date().toString(),
      isOpen:false,
      isRasxod:false,
      pending:false,
    }
  },
  computed:{
    filteredNotifications() {
      const selectedDate = new Date(this.currentData)?.toLocaleDateString("ru-RU");
      return this.allNotification?.filter((notif) =>
        notif?.date
          ? new Date(notif?.date)?.toLocaleDateString("ru-RU") === selectedDate
          : false
      );
    },
  },
  methods: {
    async getAllSumma() {
      await ipcRenderer.invoke(eventNames.listStatisticEvent, {})
        .then((res) => {
          if (res.status == 200) {
            this.allStatistics = res?.data
          }
        })
    },
    async getAllNotif(){
      await ipcRenderer.invoke(eventNames.notificationEvent,{})
      .then((res)=>{
        if(res.status==200){
          this.allNotification=res?.data?.notifications
        }
      })
    },
    handleOpenHistory(event){
      if(event=="incr"){
        this.isOpen=true
      }
      if(event=='decr'){
        this.isRasxod=true
      }
      if(event=='pending'){
        this.pending=true
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString("ru-RU");
    },
    formatSumma(summa) {
      return new Intl.NumberFormat("ru-RU").format(summa);
    },
  },
  mounted() {
    this.getAllSumma()
    this.getAllNotif()
  }

}
</script>
<style scoped>
.text16 {
  font-size: 20px;
}
p{
  font-weight: 700;
}
</style>