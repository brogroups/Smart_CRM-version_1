<template>
    <transition name="slide-modal">
        <div v-if="open" class="modal">
            <div class="modal-content d-flex column gap12">
                <div class="top d-flex column gap12">
                    <div class="d-flex j-between">
                        <h2>Общая сумма дохода</h2>
                        <Icons name="xIcon" class="stroke-red" @click="this.$emit('close')" />
                    </div>
                    <div class="d-flex j-between a-center">
                        <div class="pick radius1 d-flex a-center  border1 relative">
                            <Icons name="search" />
                            <input type="text" placeholder="Поиск по причина" class="text16" v-model="searchText" />
                        </div>
                        <div class="pick radius1 border1 relative">
                            <DatePicker placeholder="Выберите дату начала"
                                @dateSelected="handleData('start', $event)" />
                        </div>
                        <div class="pick radius1 border1 relative">
                            <DatePicker placeholder="Выберите дату окончания"
                                @dateSelected="handleData('end', $event)" />
                        </div>
                    </div>
                </div>
                <div class="page-bottom scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Причина</th>
                                <th>Дата</th>
                                <th>Цена</th>
                                <th>Описание</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="data in filteredData" :key="data.index">
                                <td>{{ data?.section }}</td>
                                <td>{{ formatDate(data?.date)}}</td>
                                <td>{{ formatSumma(data.expectedCash) }}</td>
                                <td>{{ data.title }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="text16 d-flex j-center p12" v-if="!filteredData?.length">Никаких дохода нет</div>
                </div>
            </div>
        </div>

    </transition>
</template>
<script>
import { ipcRenderer } from 'electron'
import eventNames from '@/universal/eventNames.js'
import Icons from '../components/Icons.vue'
import DatePicker from '../components/DatePicker.vue'
export default {
    name:"PendingPage",
    components: {
        Icons,
        DatePicker
    },
    props: {
        event: {
            type: String,
            default: null
        },
        open: {
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            allData: [],
            filteredData: [],
            searchText: "",
            startDate: null,
            endDate: null
        }
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString("ru-RU");
        },
        formatSumma(summa) {
            return new Intl.NumberFormat("ru-RU").format(summa);
        },
        async allHistory() {
            await ipcRenderer.invoke(eventNames.listExpectedEvent, {})
                .then((res) => {
                    console.log(res);
                    
                    if (res?.status == 200) {
                        this.allData = res?.data?.items;
                        this.applyFilters();
                    }
                });
        },
        applyFilters() {
            const searchTextLower = this.searchText.toLowerCase();
            this.filteredData = this.allData.filter(item => {
                const withinSearch = searchTextLower
                    ? item?.section?.toLowerCase().includes(searchTextLower) || item?.title?.toLowerCase().includes(searchTextLower)
                    : true;
                const withinDateRange = (!this.startDate || new Date(item.date) >= new Date(this.startDate)) &&
                    (!this.endDate || new Date(item.date) <= new Date(this.endDate));
                return withinSearch && withinDateRange;
            });
        },
        handleData(type, date) {
            if (type === 'start') {
                this.startDate = date;
            } else if (type === 'end') {
                this.endDate = date;
            }
            this.applyFilters();
        }
    },
    watch: {
        searchText() {
            this.applyFilters();
        }
    },
    mounted() {
        this.allHistory()
    }
}
</script>
<style>
.stroke-red>svg>path {
    stroke: red !important;

}

.stroke-red>svg {
    width: 36px;
    height: 36px
}
</style>