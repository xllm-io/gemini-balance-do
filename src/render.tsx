import { jsx } from 'hono/jsx';

export const Render = ({ isAuthenticated, showWarning }: { isAuthenticated: boolean; showWarning: boolean }) => {
	if (!isAuthenticated) {
		return (
			<html lang="zh-CN">
				<head>
					<meta charset="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
					<meta name="theme-color" content="#f3f4f6" />
					<title>登录</title>
					<script src="https://cdn.tailwindcss.com"></script>
				</head>
				<body class="bg-gray-100 flex items-center justify-center min-h-screen min-h-[100dvh] p-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
					<div class="w-full max-w-xs">
						<form id="login-form" class="bg-white shadow-md rounded-lg px-6 sm:px-8 py-6 sm:py-8">
							<div class="mb-4">
								<label class="block text-gray-700 text-sm font-bold mb-2" for="auth-key">
									ACCESS_KEY
								</label>
								<input
									class="shadow appearance-none border rounded w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
									id="auth-key"
									type="password"
									placeholder="******************"
									autocomplete="current-password"
								/>
							</div>
							<div class="flex items-center justify-between">
								<button
									class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-2.5 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] touch-manipulation"
									type="submit"
								>
									登录
								</button>
							</div>
						</form>
					</div>
					<script
						dangerouslySetInnerHTML={{
							__html: `
                                document.getElementById('login-form').addEventListener('submit', async function(e) {
                                    e.preventDefault();
                                    const key = document.getElementById('auth-key').value;
                                    const response = await fetch(window.location.href, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ key }),
                                    });
                                    if (response.ok) {
                                        window.location.reload();
                                    } else {
                                        alert('登录失败');
                                    }
                                });
                            `,
						}}
					></script>
				</body>
			</html>
		);
	}

	return (
		<html lang="zh-CN">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
				<meta name="theme-color" content="#1e293b" />
				<title>Gemini API 密钥管理</title>
				<script src="https://cdn.tailwindcss.com"></script>
			</head>
			<body class="bg-slate-100 text-slate-800 min-h-[100dvh]">
				{showWarning && (
					<div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 mb-0 md:mb-4" role="alert">
						<strong class="font-bold">安全警告：</strong>
						<span class="block sm:inline">当前 HOME_ACCESS_KEY 或 AUTH_KEY 为默认值，请尽快修改环境变量并重新部署 Worker！</span>
					</div>
				)}
				<div class="flex flex-col md:flex-row min-h-screen min-h-[100dvh]">
					{/* Mobile header + menu button */}
					<header class="md:hidden flex items-center justify-between bg-slate-800 text-white px-4 py-3 shrink-0">
						<button type="button" id="sidebar-toggle" class="p-2 -ml-2 rounded-lg hover:bg-slate-700 touch-manipulation" aria-label="打开菜单">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
						</button>
						<h1 class="text-lg font-bold text-sky-400">管理面板</h1>
						<div class="w-10" aria-hidden="true"></div>
					</header>
					{/* Sidebar backdrop on mobile */}
					<div id="sidebar-backdrop" class="fixed inset-0 bg-black/50 z-40 hidden md:hidden" aria-hidden="true"></div>
					<aside id="sidebar" class="fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white p-4 flex flex-col transform -translate-x-full md:translate-x-0 transition-transform duration-200 ease-out md:pt-4 pt-20">
						<h1 class="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-sky-400 hidden md:block">管理面板</h1>
						<nav class="flex flex-col space-y-1">
							<a href="#" id="nav-keys-list" class="block py-2.5 px-4 rounded-lg bg-slate-700 transition-colors touch-manipulation">
								密钥列表
							</a>
							<a href="#" id="nav-add-keys" class="block py-2.5 px-4 rounded-lg hover:bg-slate-700 transition-colors touch-manipulation">
								添加密钥
							</a>
						</nav>
					</aside>
					<main class="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto overflow-x-hidden min-w-0">
						<div id="page-keys-list">
							<h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-700">密钥列表</h2>
							<div class="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
								<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
									<h3 class="text-lg sm:text-xl font-semibold text-slate-600">已存储的密钥</h3>
									<div class="flex flex-wrap gap-2">
										<button
											id="check-keys-btn"
											class="px-4 py-2 min-h-[44px] bg-teal-500 text-white rounded-lg hover:bg-teal-600 active:bg-teal-700 transition-colors shadow-sm touch-manipulation"
										>
											一键检查
										</button>
										<button
											id="refresh-keys-btn"
											class="px-4 py-2 min-h-[44px] bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors shadow-sm touch-manipulation"
										>
											刷新
										</button>
										<button
											id="select-invalid-keys-btn"
											class="px-4 py-2 min-h-[44px] bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm hidden touch-manipulation"
										>
											勾选无效
										</button>
									</div>
								</div>
								<div class="max-h-[70vh] sm:max-h-96 overflow-auto border rounded-lg -mx-1 px-1">
									<table id="keys-table" class="w-full text-left min-w-[600px]">
										<thead class="bg-slate-50 sticky top-0 z-10">
											<tr class="border-b border-slate-200">
												<th class="p-2 sm:p-3 w-8 sm:w-10">
													<input type="checkbox" id="select-all-keys" class="rounded border-slate-300" />
												</th>
												<th class="p-2 sm:p-3 text-slate-600 font-semibold text-sm sm:text-base">API 密钥</th>
												<th class="p-2 sm:p-3 text-slate-600 font-semibold text-sm sm:text-base">状态</th>
												<th class="p-2 sm:p-3 text-slate-600 font-semibold text-sm sm:text-base hidden lg:table-cell">分组</th>
												<th class="p-2 sm:p-3 text-slate-600 font-semibold text-sm sm:text-base hidden md:table-cell">最后检查</th>
												<th class="p-2 sm:p-3 text-slate-600 font-semibold text-sm sm:text-base">失败</th>
											</tr>
										</thead>
										<tbody class="divide-y divide-slate-200"></tbody>
									</table>
								</div>
								<div id="pagination-controls" class="mt-4 flex flex-wrap justify-center items-center gap-2">
									<button
										id="prev-page-btn"
										class="px-4 py-2 min-h-[44px] bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50 shadow-sm touch-manipulation"
										disabled
									>
										上一页
									</button>
									<span id="page-info" class="mx-2 text-slate-600 text-sm sm:text-base"></span>
									<button
										id="next-page-btn"
										class="px-4 py-2 min-h-[44px] bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50 shadow-sm touch-manipulation"
										disabled
									>
										下一页
									</button>
								</div>
								<button
									id="delete-selected-keys-btn"
									class="mt-4 w-full px-4 py-2.5 min-h-[44px] bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors hidden shadow-sm touch-manipulation"
								>
									删除选中
								</button>
							</div>
						</div>
						<div id="page-add-keys" class="hidden">
							<h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-700">添加密钥</h2>
							<div class="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
								<h3 class="text-lg sm:text-xl font-semibold mb-4 text-slate-600">批量添加密钥</h3>
								<form id="add-keys-form">
									<textarea
										id="api-keys"
										class="w-full h-40 sm:h-48 p-3 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition text-base"
										placeholder="请输入API密钥，每行一个"
									></textarea>
									<button
										type="submit"
										class="mt-4 w-full px-4 py-2.5 min-h-[44px] bg-sky-500 text-white rounded-lg hover:bg-sky-600 active:bg-sky-700 transition-colors shadow-sm touch-manipulation"
									>
										添加密钥
									</button>
								</form>
							</div>
						</div>
					</main>
				</div>

				<script
					dangerouslySetInnerHTML={{
						__html: `
								document.addEventListener('DOMContentLoaded', () => {
										const addKeysForm = document.getElementById('add-keys-form');
										const apiKeysTextarea = document.getElementById('api-keys');
										const refreshKeysBtn = document.getElementById('refresh-keys-btn');
										const keysTableBody = document.querySelector('#keys-table tbody');
										const selectAllCheckbox = document.getElementById('select-all-keys');
										const deleteSelectedBtn = document.getElementById('delete-selected-keys-btn');
										const checkKeysBtn = document.getElementById('check-keys-btn');
										const paginationControls = document.getElementById('pagination-controls');
										const prevPageBtn = document.getElementById('prev-page-btn');
										const nextPageBtn = document.getElementById('next-page-btn');
										const pageInfoSpan = document.getElementById('page-info');
										const selectInvalidKeysBtn = document.getElementById('select-invalid-keys-btn');

										const navKeysList = document.getElementById('nav-keys-list');
										const navAddKeys = document.getElementById('nav-add-keys');
										const pageKeysList = document.getElementById('page-keys-list');
										const pageAddKeys = document.getElementById('page-add-keys');
										const sidebar = document.getElementById('sidebar');
										const sidebarBackdrop = document.getElementById('sidebar-backdrop');
										const sidebarToggle = document.getElementById('sidebar-toggle');

										const closeSidebar = () => {
											if (sidebar) sidebar.classList.remove('translate-x-0');
											if (sidebar) sidebar.classList.add('-translate-x-full');
											if (sidebarBackdrop) sidebarBackdrop.classList.add('hidden');
											document.body.style.overflow = '';
										};
										const openSidebar = () => {
											if (sidebar) sidebar.classList.remove('-translate-x-full');
											if (sidebar) sidebar.classList.add('translate-x-0');
											if (sidebarBackdrop) sidebarBackdrop.classList.remove('hidden');
											document.body.style.overflow = 'hidden';
										};
										if (sidebarToggle) sidebarToggle.addEventListener('click', () => {
											if (sidebar && sidebar.classList.contains('-translate-x-full')) openSidebar();
											else closeSidebar();
										});
										if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

										let currentPage = 1;
										const pageSize = 50;
										let totalPages = 1;

										const showPage = (pageId) => {
											[pageKeysList, pageAddKeys].forEach(page => {
												if (page.id === pageId) {
													page.classList.remove('hidden');
												} else {
													page.classList.add('hidden');
												}
											});
											[navKeysList, navAddKeys].forEach(nav => {
												if (nav.id === \`nav-\${pageId.split('-')[1]}-\${pageId.split('-')[2]}\`) {
													nav.classList.add('bg-slate-700');
													nav.classList.remove('hover:bg-slate-700');
												} else {
													nav.classList.remove('bg-slate-700');
													nav.classList.add('hover:bg-slate-700');
												}
											});
										};

										navKeysList.addEventListener('click', (e) => {
											e.preventDefault();
											showPage('page-keys-list');
											closeSidebar();
										});

										navAddKeys.addEventListener('click', (e) => {
											e.preventDefault();
											showPage('page-add-keys');
											closeSidebar();
										});

										const updatePaginationControls = () => {
												pageInfoSpan.textContent = \`第 \${currentPage} / \${totalPages} 页\`;
												prevPageBtn.disabled = currentPage === 1;
												nextPageBtn.disabled = currentPage >= totalPages;
										};

										const fetchAndRenderKeys = async () => {
												keysTableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-500">加载中...</td></tr>';
												try {
												  const response = await fetch(\`/api/keys?page=\${currentPage}&pageSize=\${pageSize}\`);
												  const { keys, total } = await response.json();
												  
												  totalPages = Math.ceil(total / pageSize);
												  keysTableBody.innerHTML = '';
												  if (keys.length === 0) {
												    keysTableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-500">暂无密钥</td></tr>';
												  } else {
												    keys.forEach(key => {
												      const statusMap = { normal: '正常', abnormal: '异常' };
												      const row = document.createElement('tr');
												      row.className = 'hover:bg-slate-50 transition-colors';
												      row.dataset.key = key.api_key;
												      row.innerHTML = \`
												        <td class="p-2 sm:p-3 w-8 sm:w-10"><input type="checkbox" class="key-checkbox rounded border-slate-300" data-key="\${key.api_key}" /></td>
												        <td class="p-2 sm:p-3 font-mono text-sm text-slate-700">\${key.api_key}</td>
												        <td class="p-2 sm:p-3 status-cell">\${statusMap[key.status] || key.status}</td>
												        <td class="p-2 sm:p-3 hidden lg:table-cell">\${statusMap[key.key_group] || key.key_group}</td>
												        <td class="p-2 sm:p-3 text-sm text-slate-500 hidden md:table-cell">\${key.last_checked_at ? new Date(key.last_checked_at).toLocaleString() : 'N/A'}</td>
												        <td class="p-2 sm:p-3 text-center">\${key.failed_count}</td>
												      \`;
												      keysTableBody.appendChild(row);
												    });
												  }
												  updatePaginationControls();
												} catch (error) {
												  keysTableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-red-500">加载失败</td></tr>';
												  console.error('Failed to fetch keys:', error);
												}
										};

										const updateDeleteButtonVisibility = () => {
												const selectedKeys = document.querySelectorAll('.key-checkbox:checked');
												deleteSelectedBtn.classList.toggle('hidden', selectedKeys.length === 0);
										};

										keysTableBody.addEventListener('change', (e) => {
												if (e.target.classList.contains('key-checkbox')) {
												  updateDeleteButtonVisibility();
												}
										});

										selectAllCheckbox.addEventListener('change', () => {
												const checkboxes = document.querySelectorAll('.key-checkbox');
												checkboxes.forEach(checkbox => {
												  checkbox.checked = selectAllCheckbox.checked;
												});
												updateDeleteButtonVisibility();
										});

										deleteSelectedBtn.addEventListener('click', async () => {
												const selectedKeys = Array.from(document.querySelectorAll('.key-checkbox:checked')).map(cb => cb.dataset.key);
												if (selectedKeys.length === 0) {
												  alert('请至少选择一个密钥。');
												  return;
												}

												if (!confirm(\`确定要删除选中的 \${selectedKeys.length} 个密钥吗？\`)) {
												  return;
												}

												try {
												  const response = await fetch('/api/keys', {
												    method: 'DELETE',
												    headers: { 'Content-Type': 'application/json' },
												    body: JSON.stringify({ keys: selectedKeys }),
												  });
												  const result = await response.json();
												  if (response.ok) {
												    alert(result.message || '密钥删除成功。');
												    fetchAndRenderKeys();
												    updateDeleteButtonVisibility();
												    selectAllCheckbox.checked = false;
												  } else {
												    alert(\`删除密钥失败: \${result.error || '未知错误'}\`);
												  }
												} catch (error) {
												  alert('请求失败，请检查网络连接。');
												  console.error('Failed to delete keys:', error);
												}
										});

										checkKeysBtn.addEventListener('click', async () => {
											const rows = keysTableBody.querySelectorAll('tr[data-key]');
											const keysToCheck = Array.from(rows).map(row => row.dataset.key);

											rows.forEach(row => {
												const statusCell = row.querySelector('.status-cell');
												if (statusCell) {
													statusCell.textContent = '检查中...';
													statusCell.className = 'p-2 status-cell text-gray-500';
												}
											});

											try {
												const response = await fetch('/api/keys/check', {
													method: 'POST',
													headers: { 'Content-Type': 'application/json' },
													body: JSON.stringify({ keys: keysToCheck }),
												});
												if (response.ok) {
													alert('检查完成。');
													fetchAndRenderKeys();
												} else {
													const result = await response.json();
													alert(\`检查密钥失败: \${result.error || '未知错误'}\`);
												}
											} catch (error) {
												alert('请求失败，请检查网络连接。');
												console.error('Failed to check keys:', error);
											}
										});

										selectInvalidKeysBtn.addEventListener('click', () => {
											const rows = keysTableBody.querySelectorAll('tr');
											rows.forEach(row => {
												const statusCell = row.querySelector('.status-cell');
												if (statusCell && statusCell.textContent === '无效') {
													const checkbox = row.querySelector('.key-checkbox');
													if (checkbox) {
														checkbox.checked = true;
													}
												}
											});
											updateDeleteButtonVisibility();
										});

										addKeysForm.addEventListener('submit', async (e) => {
												e.preventDefault();
												const keys = apiKeysTextarea.value.split('\\n').map(k => k.trim()).filter(k => k !== '');
												if (keys.length === 0) {
												  alert('请输入至少一个API密钥。');
												  return;
												}
												try {
												  const response = await fetch('/api/keys', {
												    method: 'POST',
												    headers: { 'Content-Type': 'application/json' },
												    body: JSON.stringify({ keys }),
												  });
												  const result = await response.json();
												  if (response.ok) {
												    alert(result.message || '密钥添加成功。');
												    apiKeysTextarea.value = '';
												    fetchAndRenderKeys();
												  } else {
												    alert(\`添加密钥失败: \${result.error || '未知错误'}\`);
												  }
												} catch (error) {
												  alert('请求失败，请检查网络连接。');
												  console.error('Failed to add keys:', error);
												}
										});

										refreshKeysBtn.addEventListener('click', fetchAndRenderKeys);

										prevPageBtn.addEventListener('click', () => {
												if (currentPage > 1) {
												  currentPage--;
												  fetchAndRenderKeys();
												}
										});

										nextPageBtn.addEventListener('click', () => {
												if (currentPage < totalPages) {
												  currentPage++;
												  fetchAndRenderKeys();
												}
										});

										// Initial load
										fetchAndRenderKeys();
								});
				  `,
					}}
				></script>
			</body>
		</html>
	);
};
