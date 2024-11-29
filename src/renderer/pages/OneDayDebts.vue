<template>
    <div class="page d-flex column gap24">
        <div class="page-top d-flex j-between a-center">
            <h2 class="page-title">Ежедневные расходы</h2>
            <div class="d-flex a-center gap12">
                <div class="item d-flex a-center debts">{{ formatSumma(allPrice) }} сум</div>
                <div class="create-button" @click="isOpen = true">Создание расход</div>
            </div>
        </div>
        <div class="d-flex j-between gap12 a-center ">
            <div class="pick radius1 d-flex a-center  border1 relative">
                <Icons name="search" />
                <input type="text" placeholder="Поиск по причина" class="text16" v-model="searchText" />
            </div>
            <div class="pick radius1 border1 relative">
                <DatePicker placeholder="Выберите дату начала" @dateSelected="handleData('start', $event)" />
            </div>
            <div class="pick radius1 border1 relative">
                <DatePicker placeholder="Выберите дату окончания" @dateSelected="handleData('end', $event)" />
            </div>
        </div>
        <div class="page-bottom scroll">
            <table>
                <thead>
                    <tr>
                        <th>Причина</th>
                        <th>Сумма</th>
                        <th>Дата</th>
                        <th>От Ково</th>
                        <th>Коммент</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="data in filteredDebts" :key="data.index">
                        <td>{{ data?.reason }}</td>
                        <td>- {{ formatSumma(data?.price) }}</td>
                        <td>{{ formatDate(data?.date) }}</td>
                        <td>{{ data?.worker }}</td>
                        <td>{{ data?.description }}</td>
                        <td class="d-flex gap12 j-end">
                            <Icons name="edit" class="icon info" @click="updateDayDebts(data)" />
                            <Icons name="deleted" class="icon danger" @click="requiredOpen(data._id)" />
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!filteredDebts?.length" class="d-flex j-center p12 text16">Комиссий пока нет</div>
        </div>
    </div>
    <PayedModal @status="handleStatus($event)" :open="isOpen" @close="handleClose" :oneDebts="dayDebts" />
    <RequiredModal :isVisible="visible" @response="handleResponse($event)" />
    <Toastiff :toastOptions="toastOptions" />
</template>

<script>
import { ipcRenderer } from 'electron';
import DatePicker from '../components/DatePicker.vue';
import Icons from '../components/Icons.vue';
import PayedModal from '../models/PayedModal.vue';
import eventNames from '@/universal/eventNames';
import RequiredModal from '../components/requiredModal.vue';
import Toastiff from '../utils/Toastiff.vue';

export default {
    components: {
        DatePicker,
        PayedModal,
        Icons,
        RequiredModal,
        Toastiff
    },
    data() {
        return {
            isOpen: false,
            allDebts: [], // Full list of debts
            filteredDebts: [], // Filtered list for display
            currentId: null,
            visible: false,
            dayDebts: null,
            allPrice: 0,
            searchText: "", // Search text for filtering
            startDate: null, // Start date for filtering
            endDate: null, // End date for filtering
            toastOptions: {
                open: false,
                text: "",
                style: { background: "#4CAF50" }
            },
        };
    },
    methods: {
        async handleData(type, date) {
            if (type === "start") {
                this.startDate = date;
            } else if (type === "end") {
                this.endDate = date;
            }

            // Filter based on selected dates
            if (this.startDate && this.endDate) {
                this.filteredDebts = this.allDebts.filter(debt => {
                    const debtDate = new Date(debt.date);
                    return debtDate >= new Date(this.startDate) && debtDate <= new Date(this.endDate);
                });
            } else if (this.startDate && !this.endDate) {
                this.filteredDebts = this.allDebts.filter(debt => {
                    const debtDate = new Date(debt.date);
                    return debtDate >= new Date(this.startDate);
                });
            } else if (!this.startDate && this.endDate) {
                this.filteredDebts = this.allDebts.filter(debt => {
                    const debtDate = new Date(debt.date);
                    return debtDate <= new Date(this.endDate);
                });
            } else {
                this.filteredDebts = this.allDebts;
            }
        },
        handleClose() {
            this.isOpen = false;
        },
        normalizeDate(date) {
            try {
                const parsedDate = new Date(date);
                if (!isNaN(parsedDate)) {
                    return parsedDate.toLocaleDateString("ru-RU");
                }
            } catch (e) {
                console.error("Invalid date format:", date);
            }
            return "Неизвестная дата";
        },
        formatDate(date) {
            return this.normalizeDate(date);
        },
        formatSumma(summa) {
            return new Intl.NumberFormat("ru-RU").format(summa);
        },
        requiredOpen(id) {
            this.currentId = id;
            this.visible = true;
        },
        handleResponse(event) {
            this.visible = false;
            if (event == true) {
                this.handleDelete();
            }
        },
        handleStatus(event) {
            this.getAllDebts();
            if (event.status === 200 || event.status === 201) {
                this.toastOptions = {
                    open: true,
                    text: event.message || "Операция выполнена успешно!",
                    style: { background: "#4CAF50" }
                };
            } else if (event.status === 400 || event.status === 401) {
                this.toastOptions = {
                    open: true,
                    text: event.message || "Произошла ошибка! Проверьте данные и попробуйте снова.",
                    style: { background: "#f44336" }
                };
            } else {
                this.toastOptions = {
                    open: true,
                    text: "Неизвестный ответ сервера.",
                    style: { background: "#ff9800" }
                };
            }
        },
        updateDayDebts(data) {
            this.dayDebts = data;
            this.isOpen = true;
        },
        async handleDelete() {
            await ipcRenderer.invoke(eventNames.deleteDayDebtsEvent, JSON.parse(JSON.stringify({ id: this.currentId })))
                .then((res) => {
                    if (res.status === 200) {
                        this.toastOptions = {
                            open: true,
                            text: "Запись успешно удалена!",
                            style: { background: "#4CAF50" }
                        };
                        this.getAllDebts();
                    } else {
                        this.toastOptions = {
                            open: true,
                            text: "Произошла ошибка при удалении записи.",
                            style: { background: "#f44336" }
                        };
                    }
                })
                .catch(() => {
                    this.toastOptions = {
                        open: true,
                        text: "Произошла ошибка при удалении записи.",
                        style: { background: "#f44336" }
                    };
                });
        },
        async getAllDebts() {
            await ipcRenderer.invoke(eventNames.listDayDebtsEvent, {})
                .then((res) => {
                    if (res.status == 200) {
                        this.allDebts = res?.data.map(item => ({
                            ...item,
                            formattedDate: this.normalizeDate(item.date)
                        }));
                        this.filteredDebts = this.allDebts;
                        this.allPrice = res.data.reduce((acc, item) => acc + item.price, 0);
                    }
                });
        },
        searchByReason() {
            const search = this.searchText?.toLowerCase();
            this.filteredDebts = this.allDebts?.filter(item =>
                item?.reason?.toLowerCase()?.includes(search)
            );
        }
    },
    watch: {
        searchText() {
            this.searchByReason();
        },
        startDate(newDate) {
            this.handleData("start", newDate);
        },
        endDate(newDate) {
            this.handleData("end", newDate);
        }
    },
    mounted() {
        this.getAllDebts();
    }
};
</script>

<style>
.pick {
    width: 33%;
    height: 24px;
}

.filter_item {
    width: 100%;
    height: 64px;
    border: 1px solid #919191;
    border-radius: 8px;
    padding: 0px 12px;
}

.pick {
    height: 48px;
    display: flex;
    align-items: center;
    padding: 14px;
}

.debts {
    padding: 10px 30px;
}
</style>
