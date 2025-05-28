// Función para formatear números como moneda
        function formatCurrency(amount) {
            return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        }

        // Función para formatear la fecha
        function formatDate(dateString) {
            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            return new Date(dateString).toLocaleDateString('es-ES', options);
        }

        // Función para determinar el icono según el tipo de movimiento
        function getTransactionIcon(type) {
            switch(type) {
                case 'CREDITO':
                    return '<i class="fas fa-arrow-up"></i>';
                case 'DEBITO':
                    return '<i class="fas fa-arrow-down"></i>';
                default:
                    return '<i class="fas fa-exchange-alt"></i>';
            }
        }

        // Función para determinar el título descriptivo
        function getTransactionTitle(type) {
            switch(type) {
                case 'CREDITO':
                    return 'Ingreso registrado';
                case 'DEBITO':
                    return 'Gasto registrado';
                default:
                    return 'Movimiento registrado';
            }
        }

        // Función para renderizar las transacciones
        function renderTransactions(transactions) {
            const transactionList = document.getElementById('transaction-list');
            transactionList.innerHTML = '';
            
            if (transactions.length === 0) {
                transactionList.innerHTML = `
                    <div class="transaction-empty">
                        <i class="fas fa-info-circle"></i>
                        <span>No hay transacciones para mostrar</span>
                    </div>
                `;
                return;
            }
            
            transactions.forEach(transaction => {
                const isIncome = transaction.tipo_de_movimiento === 'CREDITO';
                const transactionClass = isIncome ? 'income' : 'expense';
                const amountSign = isIncome ? '+' : '-';
                
                const transactionElement = document.createElement('div');
                transactionElement.className = `transaction-card ${transaction.tipo_de_movimiento}`;
                transactionElement.innerHTML = `
                    <div class="transaction-icon ${transactionClass}">
                        ${getTransactionIcon(transaction.tipo_de_movimiento)}
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-title">${getTransactionTitle(transaction.tipo_de_movimiento)}</div>
                        <div class="transaction-meta">
                            <span>Saldo anterior: ${formatCurrency(transaction.ultimo_monto)}</span>
                            <span>${formatDate(transaction.fecha_ingreso)}</span>
                        </div>
                    </div>
                    <div class="transaction-amount ${transactionClass}">
                        ${amountSign}${formatCurrency(transaction.monto)}
                    </div>
                `;
                
                transactionList.appendChild(transactionElement);
            });
        }

        // Función para filtrar transacciones
        function setupFilterTabs() {
            const tabs = document.querySelectorAll('.filter-tabs .tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Remover clase active de todos los tabs
                    tabs.forEach(t => t.classList.remove('active'));
                    // Añadir clase active al tab clickeado
                    this.classList.add('active');
                    
                    const filter = this.getAttribute('data-filter');
                    filterTransactions(filter);
                });
            });
        }

        // Función para aplicar el filtro
        function filterTransactions(filter) {
            if (filter === 'all') {
                renderTransactions(window.allTransactions);
            } else {
                const filtered = window.allTransactions.filter(t => t.tipo_de_movimiento === filter);
                renderTransactions(filtered);
            }
        }

        // Cargar datos desde la API
        function loadData() {
            // Mostrar loading
            document.getElementById('loading-overlay').style.display = 'flex';
            
            fetch("http://172.21.250.10:8000/wallet/apiwallet/")
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Network response was not ok");
                }
                return response.json();
              })
              .then((data) => {
                // Actualizar balance
                document.getElementById("balance-amount").textContent =
                  formatCurrency(data.balance);
                document.querySelector(
                  "#balance-ingresos span"
                ).textContent = `Ingresos: ${formatCurrency(
                  data.total_ingresos
                )}`;
                document.querySelector(
                  "#balance-gastos span"
                ).textContent = `Gastos: ${formatCurrency(data.total_gastos)}`;

                // Guardar y mostrar transacciones
                window.allTransactions = data.registros;
                renderTransactions(data.registros);
                setupFilterTabs();
              })
              .catch((error) => {
                console.error("Error al obtener los datos:", error);
                // Mostrar mensaje de error
                document.getElementById("transaction-list").innerHTML = `
                        <div class="transaction-error">
                            <i class="fas fa-exclamation-circle"></i>
                            <span>Error al cargar los datos. Intente nuevamente más tarde.</span>
                        </div>
                    `;
              })
              .finally(() => {
                // Ocultar loading después de 1 segundo (para que se aprecie la animación)
                setTimeout(() => {
                  document.getElementById("loading-overlay").style.display =
                    "none";
                }, 1000);
              });
        }

        // Iniciar la carga cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', loadData);