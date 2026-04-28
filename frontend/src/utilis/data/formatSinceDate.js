export const formatMemberSinceDate = (date) => {
    const d = new Date(date);

    return d.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });
}