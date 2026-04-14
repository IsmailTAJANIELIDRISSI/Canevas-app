import swal from 'sweetalert';

export const confirmation = async () => {
    const result = await swal({
        title: "Êtes-vous sûr(e) ?",
        text: "Si vous êtes sûr(e), veuillez confirmer cette action.",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    });

    if (result) {
        return true;
    } else {
        return false;
    }
}
