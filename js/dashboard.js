function toggleMenu(element, menuId){
    const targetMenu = document.getElementById(menuId);
    const targetArrow = element.querySelectorAll(".arrow");

    const allSubmenus = document.querySelectorAll('.submenu');
    const allArrows = document.querySelectorAll('.arrow');

    allSubmenus.forEach(menu => {
        if (menu.id !== menuId && menu.classList.contains('show')) {
            menu.classList.remove('show');
        }
    });

    allArrows.forEach(arrow =>{
        if (arrow !== targetArrow && arrow.classList.contains('rotate')) {
            arrow.classList.remove('rotate');
        }
    });

    targetMenu.classList.toggle("show");
    targetArrow.classList.toggle("rotate");
}