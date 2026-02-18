<#--
    Reusable Sidebar Navigation Macro
    Usage: <@sidebar.navigation currentPath="/contract-header" />
-->

<#macro navigation currentPath="/">
<nav id="sidebar" class="sidebar collapsed">
    <ul class="sidebar-menu">
        <!-- Pricing with Submenu -->
        <li class="menu-item has-submenu">
            <a href="#" class="menu-link">
                <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6h16v12H4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 10h8M8 14h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="text">Pricing</span>
                <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </a>
            <ul class="submenu">
                <li class="submenu-item">
                    <a href="/pricing-inquiry" class="submenu-link">
                        <span class="text">Pricing Inquiry</span>
                    </a>
                </li>
                <li class="submenu-item">
                    <a href="/margin-funding-maintenance" class="submenu-link">
                        <span class="text">Margin Funding Item Maintenance</span>
                    </a>
                </li>
                <li class="submenu-item">
                    <a href="/cams-eligibility" class="submenu-link">
                        <span class="text">CAMS Eligibility</span>
                    </a>
                </li>
            </ul>
        </li>
    </ul>
</nav>
</#macro>