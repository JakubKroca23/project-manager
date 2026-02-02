"use strict";
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts if needed (using standard fonts for now)
// Font.register({ family: 'Roboto', src: '...' });

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#111',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
    },
    section: {
        margin: 10,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        backgroundColor: '#eee',
        padding: 5,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 5,
    },
    label: {
        width: 100,
        fontSize: 10,
        color: '#666',
    },
    value: {
        flex: 1,
        fontSize: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f6f6f6',
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    checkbox: {
        width: 10,
        height: 10,
        borderWidth: 1,
        borderColor: '#000',
        marginRight: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#aaa',
    },
});

interface JobCardProps {
    order: any; // Type should be imported from types, but using any for simplicity in initial draft
    tasks: any[];
    bomItems: any[];
}

export const JobCardPdf = ({ order, tasks, bomItems }: JobCardProps) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>VÝROBNÍ PŘÍKAZ</Text>
                        <Text style={styles.subtitle}>ID: {order?.id?.slice(0, 8)}</Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 10 }}>Datum: {new Date().toLocaleDateString('cs-CZ')}</Text>
                        <Text style={{ fontSize: 10 }}>Termín: {new Date(order?.end_date).toLocaleDateString('cs-CZ')}</Text>
                    </View>
                </View>

                {/* Project Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Projekt</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Název:</Text>
                        <Text style={styles.value}>{order?.project?.title || 'N/A'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Klient:</Text>
                        <Text style={styles.value}>{order?.project?.client?.name || 'N/A'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Popis:</Text>
                        <Text style={styles.value}>{order?.project?.description || 'N/A'}</Text>
                    </View>
                </View>

                {/* Manufacturing Tasks */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Výrobní Úkoly</Text>
                    {tasks.map((task, i) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={styles.checkbox} />
                            <Text style={{ fontSize: 10, flex: 1 }}>{task.title}</Text>
                            <Text style={{ fontSize: 10, width: 60 }}>{task.status}</Text>
                        </View>
                    ))}
                    {tasks.length === 0 && <Text style={{ fontSize: 10, padding: 5, color: '#999' }}>Žádné definované úkoly.</Text>}
                </View>

                {/* Bill of Materials */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Materiál (BOM)</Text>
                    <View style={styles.tableHeader}>
                        <Text style={{ width: '60%', fontSize: 9 }}>Položka</Text>
                        <Text style={{ width: '20%', fontSize: 9 }}>Množství</Text>
                        <Text style={{ width: '20%', fontSize: 9 }}>Jednotka</Text>
                    </View>
                    {bomItems.map((item, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={{ width: '60%', fontSize: 10 }}>{item.name}</Text>
                            <Text style={{ width: '20%', fontSize: 10 }}>{item.quantity}</Text>
                            <Text style={{ width: '20%', fontSize: 10 }}>{item.unit}</Text>
                        </View>
                    ))}
                    {bomItems.length === 0 && <Text style={{ fontSize: 10, padding: 5, color: '#999' }}>Žádný materiál.</Text>}
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Generováno systémem Project Manager • {new Date().toLocaleString('cs-CZ')}
                </Text>
            </Page>
        </Document>
    );
};
