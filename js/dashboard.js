function toggleMenu(element, menuId){

    const menu =
        document.getElementById(menuId);

    const arrow =
        element.querySelector(".arrow");

    menu.classList.toggle("show");

    arrow.classList.toggle("rotate");
}